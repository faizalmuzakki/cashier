import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { products, productVariants, inventory } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

	const variants = await db
		.select({
			id: productVariants.id,
			variantName: productVariants.variantName,
			sku: productVariants.sku,
			barcode: productVariants.barcode,
			price: productVariants.price,
			cost: productVariants.cost,
			inventory: {
				quantity: inventory.quantity,
				lowStockThreshold: inventory.lowStockThreshold
			}
		})
		.from(productVariants)
		.leftJoin(inventory, eq(inventory.variantId, productVariants.id))
		.where(eq(productVariants.productId, params.id))
		.all();

	return {
		product,
		variants
	};
};

export const actions: Actions = {
	create: async ({ request, params, locals, platform }) => {
		if (!locals.user || !locals.tenantId || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const variantName = formData.get('variantName')?.toString();
		const sku = formData.get('sku')?.toString();
		const barcode = formData.get('barcode')?.toString();
		const price = formData.get('price')?.toString();
		const cost = formData.get('cost')?.toString();
		const initialStock = parseInt(formData.get('initialStock')?.toString() || '0');
		const lowStockThreshold = parseInt(formData.get('lowStockThreshold')?.toString() || '10');

		if (!variantName) {
			return fail(400, { error: 'Variant name is required' });
		}

		const db = getDB(platform.env.DB);
		const variantId = generateId();

		try {
			await db.insert(productVariants).values({
				id: variantId,
				productId: params.id,
				tenantId: locals.tenantId,
				variantName,
				sku: sku || null,
				barcode: barcode || null,
				price: price ? parseFloat(price) : null,
				cost: cost ? parseFloat(cost) : null
			});

			await db.insert(inventory).values({
				id: generateId(),
				tenantId: locals.tenantId,
				productId: null,
				variantId,
				locationId: null,
				quantity: initialStock,
				lowStockThreshold
			});

			return { success: true, message: 'Variant created successfully' };
		} catch (error) {
			console.error('Create variant error:', error);
			return fail(500, { error: 'Failed to create variant' });
		}
	},

	update: async ({ request, locals, platform }) => {
		if (!locals.user || !locals.tenantId || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const variantName = formData.get('variantName')?.toString();
		const sku = formData.get('sku')?.toString();
		const barcode = formData.get('barcode')?.toString();
		const price = formData.get('price')?.toString();
		const cost = formData.get('cost')?.toString();
		const currentStock = parseInt(formData.get('currentStock')?.toString() || '0');
		const lowStockThreshold = parseInt(formData.get('lowStockThreshold')?.toString() || '10');

		if (!id || !variantName) {
			return fail(400, { error: 'Variant ID and name are required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db
				.update(productVariants)
				.set({
					variantName,
					sku: sku || null,
					barcode: barcode || null,
					price: price ? parseFloat(price) : null,
					cost: cost ? parseFloat(cost) : null
				})
				.where(and(eq(productVariants.id, id), eq(productVariants.tenantId, locals.tenantId)));

			const existingInventory = await db
				.select()
				.from(inventory)
				.where(eq(inventory.variantId, id))
				.get();

			if (existingInventory) {
				await db
					.update(inventory)
					.set({
						quantity: currentStock,
						lowStockThreshold
					})
					.where(eq(inventory.id, existingInventory.id));
			}

			return { success: true, message: 'Variant updated successfully' };
		} catch (error) {
			console.error('Update variant error:', error);
			return fail(500, { error: 'Failed to update variant' });
		}
	},

	delete: async ({ request, locals, platform }) => {
		if (!locals.user || !locals.tenantId || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Variant ID is required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db
				.delete(productVariants)
				.where(and(eq(productVariants.id, id), eq(productVariants.tenantId, locals.tenantId)));

			return { success: true, message: 'Variant deleted successfully' };
		} catch (error) {
			console.error('Delete variant error:', error);
			return fail(500, { error: 'Failed to delete variant' });
		}
	}
};
