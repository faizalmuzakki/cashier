import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { products, transactions, inventory, tenantSettings } from '$lib/db/schema';
import { eq, and, gte, count, sum, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			stats: {
				todaySales: 0,
				todayTransactions: 0,
				totalProducts: 0,
				lowStockCount: 0
			},
			recentTransactions: [],
			settings: { currency: 'IDR' }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	// Get today's date range
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayTimestamp = Math.floor(today.getTime() / 1000);

	// Get tenant settings
	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

	// Get today's sales stats
	const todayStats = await db
		.select({
			totalSales: sum(transactions.total),
			transactionCount: count(transactions.id)
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.tenantId, tenantId),
				eq(transactions.status, 'COMPLETED'),
				gte(transactions.createdAt, sql`datetime(${todayTimestamp}, 'unixepoch')`)
			)
		)
		.get();

	// Get total products count
	const productStats = await db
		.select({ count: count(products.id) })
		.from(products)
		.where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
		.get();

	// Get low stock count
	const lowStockStats = await db
		.select({ count: count(inventory.id) })
		.from(inventory)
		.where(
			and(
				eq(inventory.tenantId, tenantId),
				sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`
			)
		)
		.get();

	// Get recent transactions
	const recentTransactions = await db
		.select()
		.from(transactions)
		.where(and(eq(transactions.tenantId, tenantId), eq(transactions.status, 'COMPLETED')))
		.orderBy(sql`${transactions.createdAt} DESC`)
		.limit(10)
		.all();

	return {
		stats: {
			todaySales: Number(todayStats?.totalSales || 0),
			todayTransactions: Number(todayStats?.transactionCount || 0),
			totalProducts: Number(productStats?.count || 0),
			lowStockCount: Number(lowStockStats?.count || 0)
		},
		recentTransactions,
		settings: {
			currency: settings?.currency || 'IDR'
		}
	};
};
