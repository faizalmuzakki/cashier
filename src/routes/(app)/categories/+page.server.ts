import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { categories } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || !locals.tenant || !platform?.env?.DB) {
		return { categories: [] };
	}

	const db = getDB(platform.env.DB);

	const allCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.tenantId, locals.tenant.id))
		.orderBy(categories.name)
		.all();

	return {
		categories: allCategories
	};
};

export const actions: Actions = {
	create: async ({ request, locals, platform }) => {
		if (!locals.user || !locals.tenant || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const parentId = formData.get('parentId')?.toString() || null;

		if (!name) {
			return fail(400, { error: 'Category name is required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db.insert(categories).values({
				id: generateId(),
				tenantId: locals.tenant.id,
				name,
				description: description || null,
				parentId
			});

			return { success: true, message: 'Category created successfully' };
		} catch (error) {
			console.error('Create category error:', error);
			return fail(500, { error: 'Failed to create category' });
		}
	},

	update: async ({ request, locals, platform }) => {
		if (!locals.user || !locals.tenant || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const parentId = formData.get('parentId')?.toString() || null;

		if (!id || !name) {
			return fail(400, { error: 'Category ID and name are required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db
				.update(categories)
				.set({
					name,
					description: description || null,
					parentId
				})
				.where(and(eq(categories.id, id), eq(categories.tenantId, locals.tenant.id)));

			return { success: true, message: 'Category updated successfully' };
		} catch (error) {
			console.error('Update category error:', error);
			return fail(500, { error: 'Failed to update category' });
		}
	},

	delete: async ({ request, locals, platform }) => {
		if (!locals.user || !locals.tenant || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Category ID is required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db
				.delete(categories)
				.where(and(eq(categories.id, id), eq(categories.tenantId, locals.tenant.id)));

			return { success: true, message: 'Category deleted successfully' };
		} catch (error) {
			console.error('Delete category error:', error);
			return fail(500, { error: 'Failed to delete category' });
		}
	}
};
