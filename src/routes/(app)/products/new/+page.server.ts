import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { products, inventory, categories } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			tenant: locals.tenant,
			user: locals.user,
			categories: []
		};
	}

	const db = getDB(platform.env.DB);
	const allCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.tenantId, locals.tenant.id))
		.orderBy(categories.name)
		.all();

	return {
		tenant: locals.tenant,
		user: locals.user,
		categories: allCategories
	};
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		if (!platform?.env?.DB || !locals.tenant) {
			return fail(500, { error: 'Database not available' });
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
		const initialStock = parseInt(formData.get('initialStock')?.toString() || '0');
		const lowStockThreshold = parseInt(formData.get('lowStockThreshold')?.toString() || '10');

		if (!name || price <= 0) {
			return fail(400, { error: 'Product name and valid price are required' });
		}

		const db = getDB(platform.env.DB);
		const productId = generateId();

		try {
			await db.insert(products).values({
				id: productId,
				tenantId: locals.tenant.id,
				categoryId,
				name,
				description: description || null,
				sku: sku || null,
				barcode: barcode || null,
				price,
				cost: cost ? parseFloat(cost) : null,
				trackInventory: trackInventoryValue === 'on',
				isActive: true
			});

			if (trackInventoryValue === 'on') {
				await db.insert(inventory).values({
					id: generateId(),
					tenantId: locals.tenant.id,
					productId,
					variantId: null,
					locationId: null,
					quantity: initialStock,
					lowStockThreshold
				});
			}

			throw redirect(303, '/products');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Create product error:', error);
			return fail(500, { error: 'Failed to create product' });
		}
	}
};
