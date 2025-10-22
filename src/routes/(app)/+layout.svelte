<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let mobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: 'home' },
		{ name: 'Sales', href: '/sales', icon: 'cart' },
		{ name: 'Products', href: '/products', icon: 'box' },
		{ name: 'Customers', href: '/customers', icon: 'users' },
		{ name: 'Reports', href: '/reports', icon: 'chart' }
	];
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Mobile header -->
	<header class="bg-white border-b border-gray-200 lg:hidden">
		<div class="flex items-center justify-between p-4">
			<div>
				<h1 class="text-lg font-bold text-gray-900">{data.tenant?.name || 'Cashier'}</h1>
				<p class="text-xs text-gray-500">{data.user?.fullName}</p>
			</div>
			<button
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				class="touch-target text-gray-500"
				aria-label="Toggle menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<nav class="border-t border-gray-200 px-4 py-3 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="block px-3 py-2 rounded-lg text-base font-medium transition-colors
							{$page.url.pathname.startsWith(item.href)
							? 'bg-primary-50 text-primary-700'
							: 'text-gray-700 hover:bg-gray-100'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						{item.name}
					</a>
				{/each}
				<form method="POST" action="/logout" class="pt-2">
					<button type="submit" class="w-full text-left px-3 py-2 text-red-600 font-medium">
						Logout
					</button>
				</form>
			</nav>
		{/if}
	</header>

	<!-- Desktop sidebar -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
		<div class="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
			<div class="flex items-center flex-shrink-0 px-6 py-5 border-b border-gray-200">
				<div>
					<h1 class="text-xl font-bold text-gray-900">{data.tenant?.name || 'Cashier'}</h1>
					<p class="text-sm text-gray-500">{data.user?.fullName}</p>
					<span class="text-xs text-gray-400 capitalize">{data.role}</span>
				</div>
			</div>
			<nav class="flex-1 px-3 py-4 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
							{$page.url.pathname.startsWith(item.href)
							? 'bg-primary-50 text-primary-700'
							: 'text-gray-700 hover:bg-gray-100'}"
					>
						{item.name}
					</a>
				{/each}
			</nav>
			<div class="flex-shrink-0 border-t border-gray-200 p-4">
				<form method="POST" action="/logout">
					<button type="submit" class="btn btn-secondary w-full">Logout</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Main content -->
	<div class="lg:pl-64">
		<main class="pb-20 lg:pb-8">
			{@render children()}
		</main>
	</div>

	<!-- Mobile bottom navigation -->
	<nav
		class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around"
	>
		{#each navigation as item}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center flex-1 touch-target rounded-lg transition-colors
					{$page.url.pathname.startsWith(item.href)
					? 'text-primary-600'
					: 'text-gray-500'}"
			>
				<span class="text-xs font-medium mt-1">{item.name}</span>
			</a>
		{/each}
	</nav>
</div>
