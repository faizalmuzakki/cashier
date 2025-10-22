<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let isLoading = $state(false);
	let showDeleteConfirm = $state(false);
	let trackInventory = $state(data.product.trackInventory);
</script>

<svelte:head>
	<title>Edit Product - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8 max-w-2xl mx-auto">
	<div class="mb-6">
		<a href="/products" class="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">
			← Back to Products
		</a>
		<div class="flex items-center justify-between">
			<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Edit Product</h1>
			<a href="/products/{data.product.id}/variants" class="btn-secondary text-sm">
				<svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
				</svg>
				Manage Variants
			</a>
		</div>
	</div>

	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				await update();
				isLoading = false;
			};
		}}
		class="card"
	>
		{#if form?.error}
			<div class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
				Product updated successfully!
			</div>
		{/if}

		<div class="space-y-6">
			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Product Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							class="input"
							value={data.product.name}
						/>
					</div>

					<div>
						<label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select id="categoryId" name="categoryId" class="input" value={data.product.categoryId || ''}>
							<option value="">No category</option>
							{#each data.categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea id="description" name="description" rows="3" class="input">{data.product.description || ''}</textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
							<input type="text" id="sku" name="sku" class="input" value={data.product.sku || ''} />
						</div>

						<div>
							<label for="barcode" class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
							<input type="text" id="barcode" name="barcode" class="input" value={data.product.barcode || ''} />
						</div>
					</div>
				</div>
			</div>

			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-1">
							Selling Price <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<span class="absolute left-3 top-3 text-gray-500">Rp</span>
							<input type="number" id="price" name="price" required min="0" class="input pl-12" value={data.product.price} />
						</div>
					</div>

					<div>
						<label for="cost" class="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
						<div class="relative">
							<span class="absolute left-3 top-3 text-gray-500">Rp</span>
							<input type="number" id="cost" name="cost" min="0" class="input pl-12" value={data.product.cost || ''} />
						</div>
					</div>
				</div>
			</div>

			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
				<div class="space-y-4">
					<label class="flex items-center gap-2">
						<input type="checkbox" name="trackInventory" bind:checked={trackInventory} class="rounded" />
						<span class="text-sm font-medium">Track inventory</span>
					</label>

					{#if trackInventory && data.inventory}
						<div class="grid grid-cols-2 gap-4 pl-6">
							<div>
								<label for="currentStock" class="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
								<input type="number" id="currentStock" name="currentStock" min="0" class="input" value={data.inventory.quantity} />
							</div>

							<div>
								<label for="lowStockThreshold" class="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
								<input type="number" id="lowStockThreshold" name="lowStockThreshold" min="0" class="input" value={data.inventory.lowStockThreshold || 10} />
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Status</h2>
				<label class="flex items-center gap-2">
					<input type="checkbox" name="isActive" class="rounded" checked={data.product.isActive} />
					<span class="text-sm font-medium">Product is active</span>
				</label>
				<p class="text-xs text-gray-500 mt-1">Inactive products won't appear in sales</p>
			</div>

			<div class="flex gap-3 pt-4 border-t">
				<button type="submit" class="btn btn-primary flex-1" disabled={isLoading}>
					{isLoading ? 'Saving...' : 'Save Changes'}
				</button>
				<a href="/products" class="btn btn-secondary">Cancel</a>
				<button
					type="button"
					onclick={() => (showDeleteConfirm = true)}
					class="btn btn-danger"
				>
					Delete
				</button>
			</div>
		</div>
	</form>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Delete Product?</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete "{data.product.name}"? This action cannot be undone.
			</p>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
			>
				<div class="flex gap-3">
					<button type="submit" class="btn btn-danger flex-1" disabled={isLoading}>
						{isLoading ? 'Deleting...' : 'Yes, Delete'}
					</button>
					<button
						type="button"
						onclick={() => (showDeleteConfirm = false)}
						class="btn btn-secondary"
						disabled={isLoading}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
