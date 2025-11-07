import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { products, inventory, tenantSettings, categories } from '$lib/db/schema';
import { eq, and, sql, like, or } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			products: [],
			settings: { currency: 'IDR' }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	let searchQuery = url.searchParams.get('q');
	const filterLowStock = url.searchParams.get('filter') === 'low-stock';

	// Sanitize search query
	if (searchQuery) {
		searchQuery = searchQuery.trim();
		// Limit search query length to prevent abuse
		if (searchQuery.length > 100) {
			searchQuery = searchQuery.substring(0, 100);
		}
		// Escape special SQL characters
		searchQuery = searchQuery.replace(/[_%]/g, '\\$&');
	}

	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

	const allCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.tenantId, tenantId))
		.orderBy(categories.name)
		.all();

	let query = db
		.select({
			id: products.id,
			name: products.name,
			description: products.description,
			sku: products.sku,
			barcode: products.barcode,
			price: products.price,
			cost: products.cost,
			categoryId: products.categoryId,
			isActive: products.isActive,
			inventory: {
				quantity: inventory.quantity,
				lowStockThreshold: inventory.lowStockThreshold
			}
		})
		.from(products)
		.leftJoin(inventory, eq(inventory.productId, products.id))
		.where(eq(products.tenantId, tenantId));

	if (searchQuery) {
		const searchPattern = `%${searchQuery}%`;
		query = query.where(
			and(
				eq(products.tenantId, tenantId),
				or(
					like(products.name, searchPattern),
					like(products.sku, searchPattern),
					like(products.barcode, searchPattern)
				)
			)
		);
	}

	let allProducts = await query.all();

	if (filterLowStock) {
		allProducts = allProducts.filter(
			(p) => p.inventory && p.inventory.quantity <= (p.inventory.lowStockThreshold || 10)
		);
	}

	return {
		products: allProducts,
		categories: allCategories,
		settings: {
			currency: settings?.currency || 'IDR'
		}
	};
};
