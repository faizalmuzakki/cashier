<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddModal = $state(false);
	let isLoading = $state(false);
	let searchQuery = $state('');

	const filteredCustomers = $derived(
		searchQuery
			? data.customers.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.phone?.includes(searchQuery)
			  )
			: data.customers
	);
</script>

<svelte:head>
	<title>Customers - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Customers</h1>
			<p class="text-gray-500 mt-1">{data.customers.length} total customers</p>
		</div>
		<button onclick={() => (showAddModal = true)} class="btn btn-primary">
			<svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Customer
		</button>
	</div>

	<!-- Search -->
	<div class="card mb-6">
		<input
			type="text"
			bind:value={searchQuery}
			class="input"
			placeholder="Search customers by name, email, or phone..."
		/>
	</div>

	<!-- Customers List -->
	{#if filteredCustomers.length === 0}
		<div class="card text-center py-12">
			<svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
			<p class="text-gray-500 mb-4">Add your first customer to get started</p>
			<button onclick={() => (showAddModal = true)} class="btn btn-primary inline-block">Add Customer</button>
		</div>
	{:else}
		<!-- Mobile View -->
		<div class="lg:hidden space-y-3">
			{#each filteredCustomers as customer}
				<div class="card">
					<div class="flex items-start justify-between mb-2">
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">{customer.name}</h3>
							{#if customer.email}
								<p class="text-sm text-gray-600">{customer.email}</p>
							{/if}
							{#if customer.phone}
								<p class="text-sm text-gray-600">{customer.phone}</p>
							{/if}
						</div>
						<span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
							{customer.loyaltyPoints} pts
						</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop View -->
		<div class="hidden lg:block card overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Loyalty Points</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredCustomers as customer}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
							<td class="px-6 py-4 text-sm text-gray-500">{customer.email || '-'}</td>
							<td class="px-6 py-4 text-sm text-gray-500">{customer.phone || '-'}</td>
							<td class="px-6 py-4 text-sm text-right">
								<span class="px-2 py-1 bg-primary-100 text-primary-700 rounded">
									{customer.loyaltyPoints}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Add Customer Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Add Customer</h2>

			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
						if (!form?.error) {
							showAddModal = false;
						}
					};
				}}
			>
				{#if form?.error}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{form.error}
					</div>
				{/if}

				<div class="space-y-4">
					<div>
						<label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">
							Name <span class="text-red-500">*</span>
						</label>
						<input type="text" id="customerName" name="name" required class="input" />
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input type="email" id="email" name="email" class="input" />
					</div>

					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
						<input type="tel" id="phone" name="phone" class="input" />
					</div>

					<div>
						<label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
						<textarea id="address" name="address" rows="2" class="input"></textarea>
					</div>

					<div class="flex gap-3 pt-2">
						<button type="submit" class="btn btn-primary flex-1" disabled={isLoading}>
							{isLoading ? 'Adding...' : 'Add Customer'}
						</button>
						<button
							type="button"
							onclick={() => (showAddModal = false)}
							class="btn btn-secondary"
							disabled={isLoading}
						>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}
