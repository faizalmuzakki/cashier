import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { transactions, transactionItems, users, tenantSettings } from '$lib/db/schema';
import { eq, and, gte, lte, count, sum, sql } from 'drizzle-orm';

// Helper to get date range in tenant's timezone
function getDateRange(
	dateString: string | null,
	timezone: string = 'UTC'
): { start: Date; end: Date } {
	let selectedDate = new Date();

	if (dateString) {
		try {
			const parsedDate = new Date(dateString);
			if (!isNaN(parsedDate.getTime())) {
				selectedDate = parsedDate;
			}
		} catch {
			console.warn('Invalid date parameter:', dateString);
		}
	}

	// For simplicity using locale string. In production, use date-fns-tz for proper timezone handling
	const dateInTimezone = new Date(selectedDate.toLocaleString('en-US', { timeZone: timezone }));

	const startOfDay = new Date(dateInTimezone);
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date(dateInTimezone);
	endOfDay.setHours(23, 59, 59, 999);

	return { start: startOfDay, end: endOfDay };
}

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			summary: { totalSales: 0, transactionCount: 0, averageSale: 0 },
			transactions: [],
			settings: { currency: 'IDR', timezone: 'UTC' }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	// Get tenant settings first for timezone
	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

	const tenantTimezone = settings?.timezone || 'UTC';

	// Get date range using tenant's timezone
	const dateParam = url.searchParams.get('date');
	const { start: startOfDay, end: endOfDay } = getDateRange(dateParam, tenantTimezone);

	const summaryData = await db
		.select({
			totalSales: sum(transactions.total),
			transactionCount: count(transactions.id)
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.tenantId, tenantId),
				eq(transactions.status, 'COMPLETED'),
				gte(transactions.createdAt, startOfDay),
				lte(transactions.createdAt, endOfDay)
			)
		)
		.get();

	const totalSales = Number(summaryData?.totalSales || 0);
	const transactionCount = Number(summaryData?.transactionCount || 0);

	const transactionsList = await db
		.select({
			id: transactions.id,
			transactionNumber: transactions.transactionNumber,
			total: transactions.total,
			createdAt: transactions.createdAt,
			cashierName: users.fullName,
			itemCount: count(transactionItems.id)
		})
		.from(transactions)
		.innerJoin(users, eq(users.id, transactions.cashierId))
		.leftJoin(transactionItems, eq(transactionItems.transactionId, transactions.id))
		.where(
			and(
				eq(transactions.tenantId, tenantId),
				eq(transactions.status, 'COMPLETED'),
				gte(transactions.createdAt, startOfDay),
				lte(transactions.createdAt, endOfDay)
			)
		)
		.groupBy(transactions.id, users.fullName)
		.orderBy(sql`${transactions.createdAt} DESC`)
		.all();

	return {
		summary: {
			totalSales,
			transactionCount,
			averageSale: transactionCount > 0 ? totalSales / transactionCount : 0
		},
		transactions: transactionsList,
		settings: {
			currency: settings?.currency || 'IDR',
			timezone: tenantTimezone
		}
	};
};
