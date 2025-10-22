<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let showLowStock = $state($page.url.searchParams.get('filter') === 'low-stock');
	let selectedCategoryId = $state($page.url.searchParams.get('category') || '');

	const filteredProducts = $derived(
		selectedCategoryId
			? data.products.filter(p => p.categoryId === selectedCategoryId)
			: data.products
	);

	function handleSearch() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (showLowStock) params.set('filter', 'low-stock');
		if (selectedCategoryId) params.set('category', selectedCategoryId);
		goto(`/products?${params}`);
	}

	function handleCategoryFilter() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (showLowStock) params.set('filter', 'low-stock');
		if (selectedCategoryId) params.set('category', selectedCategoryId);
		goto(`/products?${params}`);
	}
</script>

<svelte:head>
	<title>Products - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
			<p class="text-gray-500 mt-1">{filteredProducts.length} items</p>
		</div>
		<div class="flex gap-2 w-full sm:w-auto">
			<a href="/categories" class="btn-secondary flex-1 sm:flex-none text-center">
				<svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
				Categories
			</a>
			<a href="/products/new" class="btn-primary flex-1 sm:flex-none text-center">
				<svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Product
			</a>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="card mb-6">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col lg:flex-row gap-4">
				<div class="flex-1">
					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="input"
						placeholder="Search by name, SKU, or barcode..."
					/>
				</div>
				<button onclick={handleSearch} class="btn btn-primary">Search</button>
			</div>
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="flex-1">
					<select bind:value={selectedCategoryId} onchange={handleCategoryFilter} class="input">
						<option value="">All Categories</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={showLowStock}
						onchange={handleSearch}
						class="rounded border-gray-300"
					/>
					<span class="text-sm text-gray-700">Low Stock Only</span>
				</label>
			</div>
		</div>
	</div>

	<!-- Products List -->
	{#if filteredProducts.length === 0}
		<div class="card text-center py-12">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
				/>
			</svg>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
			<p class="text-gray-500 mb-4">Get started by adding your first product</p>
			<a href="/products/new" class="btn btn-primary inline-block">Add Product</a>
		</div>
	{:else}
		<!-- Mobile: Card View -->
		<div class="lg:hidden space-y-4">
			{#each filteredProducts as product}
				<a href="/products/{product.id}" class="card block hover:shadow-md transition-shadow">
					<div class="flex items-center justify-between mb-3">
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">{product.name}</h3>
							{#if product.sku}
								<p class="text-sm text-gray-500">SKU: {product.sku}</p>
							{/if}
						</div>
						{#if !product.isActive}
							<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Inactive</span>
						{/if}
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-lg font-bold text-gray-900">
								{formatCurrency(product.price, data.settings.currency)}
							</p>
							{#if product.inventory}
								<p class="text-sm text-gray-500">
									Stock: {product.inventory.quantity}
									{#if product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)}
										<span class="text-orange-600 font-medium ml-1">⚠️ Low</span>
									{/if}
								</p>
							{/if}
						</div>
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Desktop: Table View -->
		<div class="hidden lg:block card overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredProducts as product}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-gray-900">{product.name}</div>
									{#if product.description}
										<div class="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
									{/if}
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">{product.sku || '-'}</td>
								<td class="px-6 py-4 text-sm font-medium text-gray-900">
									{formatCurrency(product.price, data.settings.currency)}
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">
									{#if product.inventory}
										<span class:text-orange-600={product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)}>
											{product.inventory.quantity}
											{#if product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)}
												⚠️
											{/if}
										</span>
									{:else}
										-
									{/if}
								</td>
								<td class="px-6 py-4">
									{#if product.isActive}
										<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
									{:else}
										<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-right text-sm font-medium">
									<a href="/products/{product.id}" class="text-primary-600 hover:text-primary-900">Edit</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
