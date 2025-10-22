<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="text-center max-w-md">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Cashier POS</h1>
		<p class="text-gray-600 mb-8">Mobile-friendly point of sale system for your business</p>

		{#if data.user}
			<div class="space-y-4">
				<p class="text-lg">Welcome back, {data.user.fullName}!</p>
				{#if data.tenant}
					<a href="/dashboard" class="btn btn-primary btn-lg w-full">Go to Dashboard</a>
				{:else}
					<a href="/select-tenant" class="btn btn-primary btn-lg w-full">Select Business</a>
				{/if}
			</div>
		{:else}
			<div class="space-y-4">
				<a href="/login" class="btn btn-primary btn-lg w-full">Login</a>
				<a href="/signup" class="btn btn-secondary btn-lg w-full">Sign Up</a>
			</div>
		{/if}
	</div>
</div>
