<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
	let newTenantName = '';
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
	<div class="card w-full max-w-2xl bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="card-title text-3xl mb-2">Select Your Business</h1>
			<p class="text-base-content/70 mb-6">Choose a business to manage or create a new one</p>

			{#if form?.error}
				<div class="alert alert-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{form.error}</span>
				</div>
			{/if}

			{#if data.tenants.length > 0}
				<div class="mb-6">
					<h2 class="text-xl font-semibold mb-3">Your Businesses</h2>
					<div class="space-y-2">
						{#each data.tenants as tenant}
							<form method="POST" action="?/select" class="w-full">
								<input type="hidden" name="tenantId" value={tenant.id} />
								<button
									type="submit"
									class="btn btn-outline w-full justify-between hover:btn-primary"
								>
									<div class="text-left">
										<div class="font-semibold">{tenant.name}</div>
										<div class="text-sm opacity-70">Role: {tenant.role}</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</button>
							</form>
						{/each}
					</div>
				</div>

				<div class="divider">OR</div>
			{/if}

			{#if !showCreateForm}
				<button class="btn btn-primary w-full" on:click={() => (showCreateForm = true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Create New Business
				</button>
			{:else}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">Create New Business</h2>
					<form method="POST" action="?/create" class="space-y-4">
						<div class="form-control">
							<label class="label" for="name">
								<span class="label-text">Business Name</span>
							</label>
							<input
								type="text"
								id="name"
								name="name"
								bind:value={newTenantName}
								class="input input-bordered"
								placeholder="e.g., My Coffee Shop"
								required
								minlength="2"
							/>
						</div>

						<div class="flex gap-2">
							<button type="submit" class="btn btn-primary flex-1"> Create Business </button>
							<button
								type="button"
								class="btn btn-ghost"
								on:click={() => {
									showCreateForm = false;
									newTenantName = '';
								}}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			{/if}

			<div class="divider"></div>

			<div class="text-center">
				<a href="/logout" class="link link-hover text-sm">Sign out</a>
			</div>
		</div>
	</div>
</div>
