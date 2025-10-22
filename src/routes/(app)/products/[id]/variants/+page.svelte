<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils/currency';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showModal = $state(false);
	let editingVariant = $state<any>(null);
	let deleteConfirmId = $state<string | null>(null);

	let formData = $state({
		variantName: '',
		sku: '',
		barcode: '',
		price: '',
		cost: '',
		initialStock: '0',
		currentStock: '0',
		lowStockThreshold: '10'
	});

	function openCreateModal() {
		editingVariant = null;
		formData = {
			variantName: '',
			sku: '',
			barcode: '',
			price: '',
			cost: '',
			initialStock: '0',
			currentStock: '0',
			lowStockThreshold: '10'
		};
		showModal = true;
	}

	function openEditModal(variant: any) {
		editingVariant = variant;
		formData = {
			variantName: variant.variantName,
			sku: variant.sku || '',
			barcode: variant.barcode || '',
			price: variant.price?.toString() || '',
			cost: variant.cost?.toString() || '',
			initialStock: '0',
			currentStock: variant.inventory?.quantity?.toString() || '0',
			lowStockThreshold: variant.inventory?.lowStockThreshold?.toString() || '10'
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingVariant = null;
	}

	function confirmDelete(id: string) {
		deleteConfirmId = id;
	}

	function cancelDelete() {
		deleteConfirmId = null;
	}
</script>

<svelte:head>
	<title>Variants - {data.product.name} - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8 max-w-4xl mx-auto">
	<div class="mb-6">
		<a href="/products/{data.product.id}" class="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">
			← Back to Product
		</a>
		<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">{data.product.name}</h1>
		<p class="text-gray-500 mt-1">Product Variants</p>
	</div>

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="mb-4">
		<button onclick={openCreateModal} class="btn-primary">
			<svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Variant
		</button>
	</div>

	<!-- Variants List -->
	{#if data.variants.length === 0}
		<div class="card text-center py-12">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
			</svg>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No variants</h3>
			<p class="text-gray-500 mb-4">Add variants like sizes, colors, or different configurations</p>
			<button onclick={openCreateModal} class="btn-primary inline-block">Add Variant</button>
		</div>
	{:else}
		<!-- Mobile view -->
		<div class="grid gap-4 lg:hidden">
			{#each data.variants as variant}
				<div class="card">
					<div class="flex justify-between items-start mb-3">
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">{variant.variantName}</h3>
							{#if variant.sku}
								<p class="text-sm text-gray-500">SKU: {variant.sku}</p>
							{/if}
							{#if variant.price}
								<p class="text-lg font-bold text-gray-900 mt-1">
									{formatCurrency(variant.price, data.settings.currency)}
								</p>
							{:else}
								<p class="text-sm text-gray-500 mt-1">Uses product price</p>
							{/if}
						</div>
					</div>
					{#if variant.inventory}
						<div class="text-sm text-gray-600 mb-3">
							Stock: {variant.inventory.quantity}
							{#if variant.inventory.quantity <= (variant.inventory.lowStockThreshold || 10)}
								<span class="text-orange-600 font-medium ml-1">⚠️ Low</span>
							{/if}
						</div>
					{/if}
					<div class="flex gap-2">
						<button
							onclick={() => openEditModal(variant)}
							class="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
						>
							Edit
						</button>
						<button
							onclick={() => confirmDelete(variant.id)}
							class="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop view -->
		<div class="hidden lg:block card overflow-hidden p-0">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Variant
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							SKU
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Price
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Stock
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.variants as variant}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{variant.variantName}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{variant.sku || '-'}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{#if variant.price}
									{formatCurrency(variant.price, data.settings.currency)}
								{:else}
									<span class="text-gray-500">Product price</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
								{#if variant.inventory}
									{variant.inventory.quantity}
									{#if variant.inventory.quantity <= (variant.inventory.lowStockThreshold || 10)}
										<span class="text-orange-600 font-medium ml-1">⚠️</span>
									{/if}
								{:else}
									0
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									onclick={() => openEditModal(variant)}
									class="text-blue-600 hover:text-blue-900 mr-4"
								>
									Edit
								</button>
								<button
									onclick={() => confirmDelete(variant.id)}
									class="text-red-600 hover:text-red-900"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
			<h2 class="text-xl font-bold mb-4">
				{editingVariant ? 'Edit Variant' : 'Create Variant'}
			</h2>

			<form
				method="POST"
				action="?/{editingVariant ? 'update' : 'create'}"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						closeModal();
					};
				}}
			>
				{#if editingVariant}
					<input type="hidden" name="id" value={editingVariant.id} />
				{/if}

				<div class="space-y-4">
					<div>
						<label for="variantName" class="block text-sm font-medium text-gray-700 mb-1">
							Variant Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="variantName"
							name="variantName"
							bind:value={formData.variantName}
							required
							class="input w-full"
							placeholder="e.g., Large, Red, 500ml"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
							<input
								type="text"
								id="sku"
								name="sku"
								bind:value={formData.sku}
								class="input w-full"
							/>
						</div>

						<div>
							<label for="barcode" class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
							<input
								type="text"
								id="barcode"
								name="barcode"
								bind:value={formData.barcode}
								class="input w-full"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="price" class="block text-sm font-medium text-gray-700 mb-1">
								Price (leave empty to use product price)
							</label>
							<input
								type="number"
								id="price"
								name="price"
								bind:value={formData.price}
								min="0"
								step="0.01"
								class="input w-full"
								placeholder="0"
							/>
						</div>

						<div>
							<label for="cost" class="block text-sm font-medium text-gray-700 mb-1">Cost</label>
							<input
								type="number"
								id="cost"
								name="cost"
								bind:value={formData.cost}
								min="0"
								step="0.01"
								class="input w-full"
								placeholder="0"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						{#if editingVariant}
							<div>
								<label for="currentStock" class="block text-sm font-medium text-gray-700 mb-1">
									Current Stock
								</label>
								<input
									type="number"
									id="currentStock"
									name="currentStock"
									bind:value={formData.currentStock}
									min="0"
									class="input w-full"
								/>
							</div>
						{:else}
							<div>
								<label for="initialStock" class="block text-sm font-medium text-gray-700 mb-1">
									Initial Stock
								</label>
								<input
									type="number"
									id="initialStock"
									name="initialStock"
									bind:value={formData.initialStock}
									min="0"
									class="input w-full"
								/>
							</div>
						{/if}

						<div>
							<label for="lowStockThreshold" class="block text-sm font-medium text-gray-700 mb-1">
								Low Stock Alert
							</label>
							<input
								type="number"
								id="lowStockThreshold"
								name="lowStockThreshold"
								bind:value={formData.lowStockThreshold}
								min="0"
								class="input w-full"
							/>
						</div>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button type="button" onclick={closeModal} class="btn-secondary flex-1">
						Cancel
					</button>
					<button type="submit" class="btn-primary flex-1">
						{editingVariant ? 'Update' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold mb-4">Delete Variant</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete this variant? This action cannot be undone.
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						cancelDelete();
					};
				}}
			>
				<input type="hidden" name="id" value={deleteConfirmId} />

				<div class="flex gap-3">
					<button type="button" onclick={cancelDelete} class="btn-secondary flex-1">
						Cancel
					</button>
					<button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex-1">
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
