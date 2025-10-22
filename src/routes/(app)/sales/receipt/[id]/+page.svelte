<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDateTime } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Receipt - {data.transaction.transactionNumber}</title>
</svelte:head>

<div class="p-4 lg:p-8 max-w-2xl mx-auto">
	<div class="mb-6 text-center">
		<div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
			<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h1 class="text-2xl font-bold text-gray-900">Transaction Complete!</h1>
		<p class="text-gray-500 mt-1">Receipt #{data.transaction.transactionNumber}</p>
	</div>

	<!-- Receipt -->
	<div class="card" id="receipt">
		<div class="text-center mb-6 pb-6 border-b border-gray-200">
			<h2 class="text-xl font-bold text-gray-900">{data.tenant.name}</h2>
			<p class="text-sm text-gray-600 mt-1">{formatDateTime(data.transaction.createdAt)}</p>
		</div>

		<!-- Items -->
		<div class="mb-6">
			<table class="w-full">
				<thead class="border-b border-gray-200">
					<tr>
						<th class="text-left py-2 text-sm font-medium text-gray-700">Item</th>
						<th class="text-center py-2 text-sm font-medium text-gray-700">Qty</th>
						<th class="text-right py-2 text-sm font-medium text-gray-700">Price</th>
						<th class="text-right py-2 text-sm font-medium text-gray-700">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each data.items as item}
						<tr class="border-b border-gray-100">
							<td class="py-2 text-sm">{item.name}</td>
							<td class="py-2 text-sm text-center">{item.quantity}</td>
							<td class="py-2 text-sm text-right">{formatCurrency(item.unitPrice, data.settings.currency)}</td>
							<td class="py-2 text-sm text-right font-medium">{formatCurrency(item.total, data.settings.currency)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Totals -->
		<div class="space-y-2 mb-6 pb-6 border-b border-gray-200">
			<div class="flex justify-between text-gray-600">
				<span>Subtotal</span>
				<span>{formatCurrency(data.transaction.subtotal, data.settings.currency)}</span>
			</div>
			{#if data.transaction.taxAmount > 0}
				<div class="flex justify-between text-gray-600">
					<span>Tax</span>
					<span>{formatCurrency(data.transaction.taxAmount, data.settings.currency)}</span>
				</div>
			{/if}
			<div class="flex justify-between text-xl font-bold text-gray-900 pt-2">
				<span>Total</span>
				<span>{formatCurrency(data.transaction.total, data.settings.currency)}</span>
			</div>
		</div>

		<!-- Payment Info -->
		<div class="mb-6">
			<p class="text-sm text-gray-600">Payment Method: <span class="font-medium text-gray-900">{data.payment?.paymentMethod}</span></p>
			<p class="text-sm text-gray-600">Cashier: <span class="font-medium text-gray-900">{data.cashier?.fullName}</span></p>
		</div>

		<div class="text-center text-sm text-gray-500">
			<p>Thank you for your purchase!</p>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex gap-3 mt-6">
		<a href="/sales" class="btn btn-primary flex-1">New Sale</a>
		<button onclick={() => window.print()} class="btn btn-secondary">Print</button>
	</div>
</div>

<style>
	@media print {
		:global(body *) {
			visibility: hidden;
		}
		#receipt,
		#receipt * {
			visibility: visible;
		}
		#receipt {
			position: absolute;
			left: 0;
			top: 0;
		}
	}
</style>
