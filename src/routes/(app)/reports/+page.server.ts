import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { transactions, transactionItems, users, tenantSettings } from '$lib/db/schema';
import { eq, and, gte, lte, count, sum, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			summary: { totalSales: 0, transactionCount: 0, averageSale: 0 },
			transactions: [],
			settings: { currency: 'IDR' }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	// Validate and parse date parameter
	const dateParam = url.searchParams.get('date');
	let selectedDate = new Date();

	if (dateParam) {
		try {
			const parsedDate = new Date(dateParam);
			// Check if date is valid
			if (!isNaN(parsedDate.getTime())) {
				selectedDate = parsedDate;
			}
		} catch (error) {
			// Use current date if parsing fails
			console.warn('Invalid date parameter:', dateParam);
		}
	}

	const startOfDay = new Date(selectedDate);
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date(selectedDate);
	endOfDay.setHours(23, 59, 59, 999);

	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

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
			currency: settings?.currency || 'IDR'
		}
	};
};
