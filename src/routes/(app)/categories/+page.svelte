<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showModal = $state(false);
	let editingCategory = $state<any>(null);
	let searchQuery = $state('');
	let deleteConfirmId = $state<string | null>(null);

	let formData = $state({
		name: '',
		description: '',
		parentId: ''
	});

	const filteredCategories = $derived(
		searchQuery
			? data.categories.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.description?.toLowerCase().includes(searchQuery.toLowerCase())
			  )
			: data.categories
	);

	function openCreateModal() {
		editingCategory = null;
		formData = { name: '', description: '', parentId: '' };
		showModal = true;
	}

	function openEditModal(category: any) {
		editingCategory = category;
		formData = {
			name: category.name,
			description: category.description || '',
			parentId: category.parentId || ''
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingCategory = null;
		formData = { name: '', description: '', parentId: '' };
	}

	function confirmDelete(id: string) {
		deleteConfirmId = id;
	}

	function cancelDelete() {
		deleteConfirmId = null;
	}
</script>

<svelte:head>
	<title>Categories - {data.tenant.name}</title>
</svelte:head>

<div class="p-4 lg:p-8">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
		<div>
			<h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Categories</h1>
			<p class="text-gray-500 mt-1">Organize your products into categories</p>
		</div>
		<button
			onclick={openCreateModal}
			class="btn-primary w-full sm:w-auto"
		>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Category
		</button>
	</div>

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

	<!-- Search -->
	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search categories..."
			class="input w-full"
		/>
	</div>

	<!-- Categories List -->
	{#if filteredCategories.length === 0}
		<div class="text-center py-12">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No categories</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
			<div class="mt-6">
				<button onclick={openCreateModal} class="btn-primary">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Category
				</button>
			</div>
		</div>
	{:else}
		<!-- Mobile view -->
		<div class="grid gap-4 lg:hidden">
			{#each filteredCategories as category}
				<div class="card">
					<div class="flex justify-between items-start mb-2">
						<div class="flex-1">
							<h3 class="font-semibold text-gray-900">{category.name}</h3>
							{#if category.description}
								<p class="text-sm text-gray-500 mt-1">{category.description}</p>
							{/if}
						</div>
					</div>
					<div class="flex gap-2 mt-3">
						<button
							onclick={() => openEditModal(category)}
							class="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
						>
							Edit
						</button>
						<button
							onclick={() => confirmDelete(category.id)}
							class="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop view -->
		<div class="hidden lg:block card overflow-hidden p-0">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Name
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Description
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredCategories as category}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{category.name}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">
								{category.description || '-'}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									onclick={() => openEditModal(category)}
									class="text-blue-600 hover:text-blue-900 mr-4"
								>
									Edit
								</button>
								<button
									onclick={() => confirmDelete(category.id)}
									class="text-red-600 hover:text-red-900"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold mb-4">
				{editingCategory ? 'Edit Category' : 'Create Category'}
			</h2>

			<form
				method="POST"
				action="?/{editingCategory ? 'update' : 'create'}"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						closeModal();
					};
				}}
			>
				{#if editingCategory}
					<input type="hidden" name="id" value={editingCategory.id} />
				{/if}

				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={formData.name}
							required
							class="input w-full"
						/>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							id="description"
							name="description"
							bind:value={formData.description}
							rows="3"
							class="input w-full"
						></textarea>
					</div>

					<div>
						<label for="parentId" class="block text-sm font-medium text-gray-700 mb-1">
							Parent Category (Optional)
						</label>
						<select id="parentId" name="parentId" bind:value={formData.parentId} class="input w-full">
							<option value="">None</option>
							{#each data.categories.filter(c => c.id !== editingCategory?.id) as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button type="button" onclick={closeModal} class="btn-secondary flex-1">
						Cancel
					</button>
					<button type="submit" class="btn-primary flex-1">
						{editingCategory ? 'Update' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteConfirmId}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-xl font-bold mb-4">Delete Category</h2>
			<p class="text-gray-600 mb-6">
				Are you sure you want to delete this category? Products in this category will not be deleted, but will be uncategorized.
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						cancelDelete();
					};
				}}
			>
				<input type="hidden" name="id" value={deleteConfirmId} />

				<div class="flex gap-3">
					<button type="button" onclick={cancelDelete} class="btn-secondary flex-1">
						Cancel
					</button>
					<button type="submit" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex-1">
						Delete
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
