<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type CartItem = {
		productId: string;
		name: string;
		price: number;
		quantity: number;
	};

	let cart = $state<CartItem[]>([]);
	let searchQuery = $state('');
	let showPaymentModal = $state(false);
	let isProcessing = $state(false);
	let selectedCustomer = $state<string | null>(null);
	let discountType = $state<'none' | 'percentage' | 'fixed'>('none');
	let discountValue = $state(0);

	let subtotal = $derived(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
	let discountAmount = $derived(
		discountType === 'percentage'
			? subtotal * (discountValue / 100)
			: discountType === 'fixed'
			? discountValue
			: 0
	);
	let subtotalAfterDiscount = $derived(Math.max(0, subtotal - discountAmount));
	let taxAmount = $derived(subtotalAfterDiscount * ((data.settings.taxRate || 0) / 100));
	let total = $derived(subtotalAfterDiscount + taxAmount);

	function addToCart(product: any) {
		const existing = cart.find((item) => item.productId === product.id);
		if (existing) {
			existing.quantity++;
		} else {
			cart.push({
				productId: product.id,
				name: product.name,
				price: product.price,
				quantity: 1
			});
		}
		cart = [...cart];
		searchQuery = '';
	}

	function updateQuantity(index: number, newQty: number) {
		if (newQty <= 0) {
			cart.splice(index, 1);
		} else {
			cart[index].quantity = newQty;
		}
		cart = [...cart];
	}

	function removeItem(index: number) {
		cart.splice(index, 1);
		cart = [...cart];
	}

	function clearCart() {
		cart = [];
		showPaymentModal = false;
	}

	const filteredProducts = $derived(
		searchQuery
			? data.products.filter(
					(p) =>
						p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
			  )
			: []
	);
</script>

<svelte:head>
	<title>New Sale - {data.tenant.name}</title>
</svelte:head>

<div class="h-[calc(100vh-4rem)] lg:h-screen flex flex-col lg:flex-row">
	<!-- Left: Product Search -->
	<div class="lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
		<h2 class="text-xl font-bold text-gray-900 mb-4">Products</h2>

		<!-- Search -->
		<div class="mb-4">
			<input
				type="text"
				bind:value={searchQuery}
				class="input"
				placeholder="Search product by name, SKU, or scan barcode..."
				autofocus
			/>
		</div>

		<!-- Product List -->
		{#if searchQuery && filteredProducts.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each filteredProducts as product}
					<button
						onclick={() => addToCart(product)}
						class="card text-left hover:shadow-md transition-shadow p-3"
					>
						<h3 class="font-semibold text-gray-900">{product.name}</h3>
						{#if product.sku}
							<p class="text-xs text-gray-500">SKU: {product.sku}</p>
						{/if}
						<p class="text-lg font-bold text-primary-600 mt-1">
							{formatCurrency(product.price, data.settings.currency)}
						</p>
						{#if product.inventory}
							<p class="text-xs text-gray-500">Stock: {product.inventory.quantity}</p>
						{/if}
					</button>
				{/each}
			</div>
		{:else if searchQuery}
			<div class="text-center py-8 text-gray-500">
				<p>No products found</p>
			</div>
		{:else}
			<div class="text-center py-8 text-gray-400">
				<svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<p>Search for products to add to cart</p>
			</div>
		{/if}
	</div>

	<!-- Right: Cart & Checkout -->
	<div class="lg:w-1/2 p-4 lg:p-6 flex flex-col overflow-y-auto">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold text-gray-900">Cart</h2>
			{#if cart.length > 0}
				<button onclick={clearCart} class="text-sm text-red-600 hover:text-red-700">Clear All</button>
			{/if}
		</div>

		<!-- Cart Items -->
		<div class="flex-1 overflow-y-auto mb-4">
			{#if cart.length === 0}
				<div class="text-center py-12 text-gray-400">
					<svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					<p>Cart is empty</p>
					<p class="text-sm mt-1">Add products to get started</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each cart as item, index}
						<div class="card p-3">
							<div class="flex items-start justify-between mb-2">
								<div class="flex-1">
									<h3 class="font-semibold text-gray-900">{item.name}</h3>
									<p class="text-sm text-gray-600">
										{formatCurrency(item.price, data.settings.currency)} each
									</p>
								</div>
								<button
									onclick={() => removeItem(index)}
									class="text-red-600 hover:text-red-700 ml-2"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<button
										onclick={() => updateQuantity(index, item.quantity - 1)}
										class="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
									>
										-
									</button>
									<input
										type="number"
										value={item.quantity}
										onchange={(e) => updateQuantity(index, parseInt(e.currentTarget.value) || 1)}
										class="w-16 text-center border border-gray-300 rounded px-2 py-1"
										min="1"
									/>
									<button
										onclick={() => updateQuantity(index, item.quantity + 1)}
										class="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
									>
										+
									</button>
								</div>
								<p class="font-bold text-gray-900">
									{formatCurrency(item.price * item.quantity, data.settings.currency)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Customer Selection -->
		{#if cart.length > 0 && data.customers.length > 0}
			<div class="border-t border-gray-200 pt-4 mb-4">
				<label for="customer" class="block text-sm font-medium text-gray-700 mb-1">Customer (Optional)</label>
				<select id="customer" bind:value={selectedCustomer} class="input">
					<option value={null}>Walk-in Customer</option>
					{#each data.customers as customer}
						<option value={customer.id}>{customer.name}</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- Discount -->
		{#if cart.length > 0}
			<div class="border-t border-gray-200 pt-4 mb-4">
				<label class="block text-sm font-medium text-gray-700 mb-2">Discount</label>
				<div class="flex gap-2 mb-2">
					<button
						onclick={() => (discountType = 'none')}
						class="px-3 py-1 rounded text-sm {discountType === 'none' ? 'bg-primary-600 text-white' : 'bg-gray-200'}"
					>
						None
					</button>
					<button
						onclick={() => (discountType = 'percentage')}
						class="px-3 py-1 rounded text-sm {discountType === 'percentage' ? 'bg-primary-600 text-white' : 'bg-gray-200'}"
					>
						%
					</button>
					<button
						onclick={() => (discountType = 'fixed')}
						class="px-3 py-1 rounded text-sm {discountType === 'fixed' ? 'bg-primary-600 text-white' : 'bg-gray-200'}"
					>
						Rp
					</button>
				</div>
				{#if discountType !== 'none'}
					<input
						type="number"
						bind:value={discountValue}
						min="0"
						max={discountType === 'percentage' ? 100 : subtotal}
						class="input"
						placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
					/>
				{/if}
			</div>
		{/if}

		<!-- Totals -->
		{#if cart.length > 0}
			<div class="border-t border-gray-200 pt-4 space-y-2">
				<div class="flex justify-between text-gray-600">
					<span>Subtotal</span>
					<span>{formatCurrency(subtotal, data.settings.currency)}</span>
				</div>
				{#if discountAmount > 0}
					<div class="flex justify-between text-green-600">
						<span>Discount</span>
						<span>-{formatCurrency(discountAmount, data.settings.currency)}</span>
					</div>
				{/if}
				{#if data.settings.taxRate && data.settings.taxRate > 0}
					<div class="flex justify-between text-gray-600">
						<span>Tax ({data.settings.taxRate}%)</span>
						<span>{formatCurrency(taxAmount, data.settings.currency)}</span>
					</div>
				{/if}
				<div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
					<span>Total</span>
					<span>{formatCurrency(total, data.settings.currency)}</span>
				</div>
			</div>

			<!-- Checkout Button -->
			<button
				onclick={() => (showPaymentModal = true)}
				class="btn btn-primary btn-lg w-full mt-4"
			>
				Checkout
			</button>
		{/if}
	</div>
</div>

<!-- Payment Modal -->
{#if showPaymentModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Complete Payment</h2>

			<div class="mb-6">
				<div class="bg-gray-50 rounded-lg p-4 mb-4">
					<div class="flex justify-between mb-2">
						<span class="text-gray-600">Total Amount</span>
						<span class="text-2xl font-bold text-gray-900">
							{formatCurrency(total, data.settings.currency)}
						</span>
					</div>
				</div>

				<form
					method="POST"
					use:enhance={() => {
						isProcessing = true;
						return async ({ update }) => {
							await update();
							isProcessing = false;
							if (!form?.error) {
								clearCart();
							}
						};
					}}
				>
					{#if form?.error}
						<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{form.error}
						</div>
					{/if}

					<!-- Hidden cart data -->
					<input type="hidden" name="cartData" value={JSON.stringify(cart)} />
					<input type="hidden" name="customerId" value={selectedCustomer || ''} />
					<input type="hidden" name="subtotal" value={subtotal} />
					<input type="hidden" name="discountAmount" value={discountAmount} />
					<input type="hidden" name="taxAmount" value={taxAmount} />
					<input type="hidden" name="total" value={total} />

					<div class="space-y-4">
						<div>
							<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">
								Payment Method
							</label>
							<select id="paymentMethod" name="paymentMethod" required class="input">
								<option value="CASH">Cash</option>
								<option value="CARD">Card</option>
								<option value="DIGITAL_WALLET">Digital Wallet</option>
								<option value="OTHER">Other</option>
							</select>
						</div>

						<div class="flex gap-3">
							<button type="submit" class="btn btn-primary flex-1" disabled={isProcessing}>
								{isProcessing ? 'Processing...' : 'Complete Sale'}
							</button>
							<button
								type="button"
								onclick={() => (showPaymentModal = false)}
								class="btn btn-secondary"
								disabled={isProcessing}
							>
								Cancel
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
