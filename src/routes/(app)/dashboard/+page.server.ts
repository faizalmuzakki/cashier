import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { products, transactions, inventory, tenantSettings } from '$lib/db/schema';
import { eq, and, gte, count, sum, sql } from 'drizzle-orm';

// Helper to get start of day in tenant's timezone
function getStartOfDay(timezone: string = 'UTC'): Date {
	const now = new Date();
	// For simplicity, using UTC. In production, use a library like date-fns-tz for proper timezone handling
	const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
	startOfDay.setHours(0, 0, 0, 0);
	return startOfDay;
}

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
			settings: { currency: 'IDR', timezone: 'UTC' }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	// Get tenant settings first to use the correct timezone
	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

	const tenantTimezone = settings?.timezone || 'UTC';

	// Get today's date range using tenant's timezone
	const today = getStartOfDay(tenantTimezone);
	const todayTimestamp = Math.floor(today.getTime() / 1000);

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
			todaySales: todayStats?.totalSales ? Number(todayStats.totalSales) : 0,
			todayTransactions: todayStats?.transactionCount ? Number(todayStats.transactionCount) : 0,
			totalProducts: productStats?.count ? Number(productStats.count) : 0,
			lowStockCount: lowStockStats?.count ? Number(lowStockStats.count) : 0
		},
		recentTransactions,
		settings: {
			currency: settings?.currency || 'IDR',
			timezone: tenantTimezone
		}
	};
};
