<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let isLoading = $state(false);
</script>

<svelte:head>
	<title>Sign Up - Cashier POS</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
			<p class="text-gray-600 mt-2">Start managing your business today</p>
		</div>

		<div class="card">
			<!-- Google OAuth -->
			<form method="POST" action="?/google" class="mb-6">
				<button type="submit" class="btn btn-secondary w-full">
					Sign up with Google
				</button>
			</form>

			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">Or sign up with email</span>
				</div>
			</div>

			<!-- Email/Password Form -->
			<form
				method="POST"
				action="?/email"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
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
						<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							required
							class="input"
							placeholder="John Doe"
							value={form?.fullName ?? ''}
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							class="input"
							placeholder="you@example.com"
							value={form?.email ?? ''}
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							required
							class="input"
							placeholder="••••••••"
							minlength="8"
						/>
						<p class="text-xs text-gray-500 mt-1">
							At least 8 characters with uppercase, lowercase, and number
						</p>
					</div>

					<div>
						<label for="businessName" class="block text-sm font-medium text-gray-700 mb-1">
							Business Name
						</label>
						<input
							type="text"
							id="businessName"
							name="businessName"
							required
							class="input"
							placeholder="My Store"
							value={form?.businessName ?? ''}
						/>
						<p class="text-xs text-gray-500 mt-1">You can add more businesses later</p>
					</div>

					<button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
						{isLoading ? 'Creating account...' : 'Create Account'}
					</button>
				</div>
			</form>

			<div class="mt-6 text-center text-sm text-gray-600">
				Already have an account?
				<a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
					Sign in
				</a>
			</div>
		</div>
	</div>
</div>
