<script lang="ts">
	import { formatCurrency } from '$lib/utils/currency';
	import { formatDate } from '$lib/utils/date';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();
	let showVerificationBanner = $derived($page.url.searchParams.get('verify') === 'pending' || (!data.user.emailVerified && !data.user.googleId));
</script>

<svelte:head>
	<title>Dashboard - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="text-gray-500 mt-1">Welcome back, {data.user.fullName}!</p>
	</div>

	<!-- Email Verification Notice -->
	{#if showVerificationBanner}
		<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
			<div class="flex items-start">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
					</svg>
				</div>
				<div class="ml-3 flex-1">
					<p class="text-sm text-yellow-700">
						Please verify your email address. We've sent a verification link to <strong>{data.user.email}</strong>.
					</p>
					<p class="mt-2">
						<a href="/auth/resend-verification" class="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline">
							Resend verification email
						</a>
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<div class="card">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Today's Sales</p>
					<p class="text-2xl font-bold text-gray-900 mt-1">
						{formatCurrency(data.stats.todaySales, data.settings.currency)}
					</p>
				</div>
				<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
					<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Transactions</p>
					<p class="text-2xl font-bold text-gray-900 mt-1">{data.stats.todayTransactions}</p>
				</div>
				<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
					<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Products</p>
					<p class="text-2xl font-bold text-gray-900 mt-1">{data.stats.totalProducts}</p>
				</div>
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
						/>
					</svg>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-500">Low Stock Items</p>
					<p class="text-2xl font-bold text-gray-900 mt-1">{data.stats.lowStockCount}</p>
				</div>
				<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
					<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
			<a href="/sales" class="card hover:shadow-md transition-shadow">
				<div class="text-center">
					<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900">New Sale</p>
				</div>
			</a>

			<a href="/products" class="card hover:shadow-md transition-shadow">
				<div class="text-center">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900">Add Product</p>
				</div>
			</a>

			<a href="/reports" class="card hover:shadow-md transition-shadow">
				<div class="text-center">
					<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900">View Reports</p>
				</div>
			</a>

			<a href="/products?filter=low-stock" class="card hover:shadow-md transition-shadow">
				<div class="text-center">
					<div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
							/>
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-900">Low Stock</p>
				</div>
			</a>
		</div>
	</div>

	<!-- Recent Transactions -->
	{#if data.recentTransactions.length > 0}
		<div>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Recent Transactions</h2>
				<a href="/reports" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
					View all
				</a>
			</div>
			<div class="card overflow-hidden">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
								<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
								<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each data.recentTransactions as transaction}
								<tr>
									<td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
										{transaction.transactionNumber}
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
										{formatDate(transaction.createdAt)}
									</td>
									<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
										{formatCurrency(transaction.total, data.settings.currency)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{:else}
		<div class="card text-center py-12">
			<p class="text-gray-500">No transactions yet. Start making sales!</p>
			<a href="/sales" class="btn btn-primary mt-4 inline-block">New Sale</a>
		</div>
	{/if}
</div>
