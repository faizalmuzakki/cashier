<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let isLoading = $state(false);
	let trackInventory = $state(true);
</script>

<svelte:head>
	<title>Add Product - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8 max-w-2xl mx-auto">
	<div class="mb-6">
		<a href="/products" class="text-primary-600 hover:text-primary-700 text-sm font-medium mb-2 inline-block">
			← Back to Products
		</a>
		<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Add Product</h1>
	</div>

	<form
		method="POST"
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
							placeholder="e.g., Coffee Latte"
						/>
					</div>

					<div>
						<label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select id="categoryId" name="categoryId" class="input">
							<option value="">No category</option>
							{#each data.categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea id="description" name="description" rows="3" class="input" placeholder="Optional"></textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
							<input type="text" id="sku" name="sku" class="input" placeholder="COFFEE-001" />
						</div>

						<div>
							<label for="barcode" class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
							<input type="text" id="barcode" name="barcode" class="input" placeholder="123456" />
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
							<input type="number" id="price" name="price" required min="0" class="input pl-12" placeholder="25000" />
						</div>
					</div>

					<div>
						<label for="cost" class="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
						<div class="relative">
							<span class="absolute left-3 top-3 text-gray-500">Rp</span>
							<input type="number" id="cost" name="cost" min="0" class="input pl-12" placeholder="15000" />
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

					{#if trackInventory}
						<div class="grid grid-cols-2 gap-4 pl-6">
							<div>
								<label for="initialStock" class="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
								<input type="number" id="initialStock" name="initialStock" min="0" class="input" placeholder="0" />
							</div>

							<div>
								<label for="lowStockThreshold" class="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
								<input type="number" id="lowStockThreshold" name="lowStockThreshold" min="0" class="input" placeholder="10" />
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex gap-3 pt-4">
				<button type="submit" class="btn btn-primary flex-1" disabled={isLoading}>
					{isLoading ? 'Adding...' : 'Add Product'}
				</button>
				<a href="/products" class="btn btn-secondary">Cancel</a>
			</div>
		</div>
	</form>
</div>
