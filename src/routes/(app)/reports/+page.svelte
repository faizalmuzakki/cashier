<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedDate = $state(new Date().toISOString().split('T')[0]);

	function handleDateChange() {
		window.location.href = `/reports?date=${selectedDate}`;
	}
</script>

<svelte:head>
	<title>Reports - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Sales Report</h1>
		<p class="text-gray-500 mt-1">View your daily sales performance</p>
	</div>

	<!-- Date Selector -->
	<div class="card mb-6">
		<div class="flex items-center gap-4">
			<label for="reportDate" class="text-sm font-medium text-gray-700">Select Date:</label>
			<input
				type="date"
				id="reportDate"
				bind:value={selectedDate}
				onchange={handleDateChange}
				class="input max-w-xs"
			/>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div class="card">
			<p class="text-sm text-gray-500 mb-1">Total Sales</p>
			<p class="text-2xl font-bold text-gray-900">
				{formatCurrency(data.summary.totalSales, data.settings.currency)}
			</p>
		</div>

		<div class="card">
			<p class="text-sm text-gray-500 mb-1">Transactions</p>
			<p class="text-2xl font-bold text-gray-900">{data.summary.transactionCount}</p>
		</div>

		<div class="card">
			<p class="text-sm text-gray-500 mb-1">Average Sale</p>
			<p class="text-2xl font-bold text-gray-900">
				{formatCurrency(data.summary.averageSale, data.settings.currency)}
			</p>
		</div>
	</div>

	<!-- Transactions List -->
	<div class="card">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Transactions</h2>

		{#if data.transactions.length === 0}
			<div class="text-center py-12">
				<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p class="text-gray-500">No transactions for this date</p>
			</div>
		{:else}
			<!-- Mobile View -->
			<div class="lg:hidden space-y-3">
				{#each data.transactions as transaction}
					<a href="/sales/receipt/{transaction.id}" class="card block hover:shadow-md transition-shadow">
						<div class="flex items-center justify-between mb-2">
							<span class="font-semibold text-gray-900">{transaction.transactionNumber}</span>
							<span class="text-xs text-gray-500">{formatDateTime(transaction.createdAt)}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-600">{transaction.itemCount} items</span>
							<span class="font-bold text-gray-900">
								{formatCurrency(transaction.total, data.settings.currency)}
							</span>
						</div>
					</a>
				{/each}
			</div>

			<!-- Desktop View -->
			<div class="hidden lg:block overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.transactions as transaction}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 text-sm font-medium text-gray-900">{transaction.transactionNumber}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{formatDateTime(transaction.createdAt)}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{transaction.itemCount}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{transaction.cashierName}</td>
								<td class="px-6 py-4 text-sm font-medium text-gray-900 text-right">
									{formatCurrency(transaction.total, data.settings.currency)}
								</td>
								<td class="px-6 py-4 text-sm text-right">
									<a href="/sales/receipt/{transaction.id}" class="text-primary-600 hover:text-primary-700">
										View
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
