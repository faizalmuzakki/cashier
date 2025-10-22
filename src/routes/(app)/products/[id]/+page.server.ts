import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { products, inventory, categories } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		throw error(500, 'Database not available');
	}

	const db = getDB(platform.env.DB);

	const product = await db
		.select()
		.from(products)
		.where(eq(products.id, params.id))
		.get();

	if (!product || product.tenantId !== locals.tenant.id) {
		throw error(404, 'Product not found');
	}

	const inventoryRecord = await db
		.select()
		.from(inventory)
		.where(eq(inventory.productId, params.id))
		.get();

	const allCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.tenantId, locals.tenant.id))
		.orderBy(categories.name)
		.all();

	return {
		product,
		inventory: inventoryRecord,
		categories: allCategories
	};
};

export const actions: Actions = {
	update: async ({ request, params, platform, locals }) => {
		if (!platform?.env?.DB || !locals.tenant) {
			return fail(500, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const categoryId = formData.get('categoryId')?.toString() || null;
		const sku = formData.get('sku')?.toString();
		const barcode = formData.get('barcode')?.toString();
		const price = parseFloat(formData.get('price')?.toString() || '0');
		const cost = formData.get('cost')?.toString();
		const trackInventoryValue = formData.get('trackInventory');
		const currentStock = parseInt(formData.get('currentStock')?.toString() || '0');
		const lowStockThreshold = parseInt(formData.get('lowStockThreshold')?.toString() || '10');
		const isActive = formData.get('isActive') === 'on';

		if (!name || price <= 0) {
			return fail(400, { error: 'Product name and valid price are required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db
				.update(products)
				.set({
					name,
					description: description || null,
					categoryId,
					sku: sku || null,
					barcode: barcode || null,
					price,
					cost: cost ? parseFloat(cost) : null,
					trackInventory: trackInventoryValue === 'on',
					isActive
				})
				.where(eq(products.id, params.id));

			if (trackInventoryValue === 'on') {
				const existing = await db
					.select()
					.from(inventory)
					.where(eq(inventory.productId, params.id))
					.get();

				if (existing) {
					await db
						.update(inventory)
						.set({
							quantity: currentStock,
							lowStockThreshold
						})
						.where(eq(inventory.id, existing.id));
				}
			}

			return { success: true };
		} catch (err) {
			console.error('Update error:', err);
			return fail(500, { error: 'Failed to update product' });
		}
	},

	delete: async ({ params, platform, locals }) => {
		if (!platform?.env?.DB || !locals.tenant) {
			return fail(500, { error: 'Not authorized' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db.delete(products).where(eq(products.id, params.id));
			throw redirect(303, '/products');
		} catch (err) {
			if (err instanceof Response) throw err;
			console.error('Delete error:', err);
			return fail(500, { error: 'Failed to delete product' });
		}
	}
};
