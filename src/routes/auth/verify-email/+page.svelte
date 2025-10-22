<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900">Email Verification</h2>
		</div>

		<div class="bg-white p-8 rounded-lg shadow-md">
			{#if data.success}
				<div class="text-center space-y-4">
					<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
						<svg
							class="w-8 h-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<p class="text-green-600 font-medium">{data.message}</p>
					<a
						href="/auth/login"
						class="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
					>
						Go to Login
					</a>
				</div>
			{:else}
				<div class="text-center space-y-4">
					<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<svg
							class="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<p class="text-red-600 font-medium">{data.message}</p>
					<div class="space-y-2">
						<a
							href="/auth/resend-verification"
							class="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
						>
							Resend Verification Email
						</a>
						<a
							href="/auth/login"
							class="inline-block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
						>
							Back to Login
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
