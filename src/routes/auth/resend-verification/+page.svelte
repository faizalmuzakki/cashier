<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900">Resend Verification Email</h2>
			<p class="mt-2 text-gray-600">Enter your email to receive a new verification link</p>
		</div>

		<div class="bg-white p-8 rounded-lg shadow-md">
			{#if form?.success}
				<div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
					{form.message}
				</div>
			{/if}

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
					{form.error}
				</div>
			{/if}

			<form method="POST" class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="you@example.com"
					/>
				</div>

				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
				>
					Send Verification Email
				</button>

				<div class="text-center">
					<a href="/auth/login" class="text-sm text-blue-600 hover:text-blue-700">
						Back to Login
					</a>
				</div>
			</form>
		</div>
	</div>
</div>
