import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { transactions, transactionItems, payments, users, tenantSettings } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		throw error(500, 'Database not available');
	}

	const db = getDB(platform.env.DB);

	const transaction = await db
		.select()
		.from(transactions)
		.where(eq(transactions.id, params.id))
		.get();

	if (!transaction || transaction.tenantId !== locals.tenant.id) {
		throw error(404, 'Transaction not found');
	}

	const items = await db
		.select()
		.from(transactionItems)
		.where(eq(transactionItems.transactionId, params.id))
		.all();

	const payment = await db
		.select()
		.from(payments)
		.where(eq(payments.transactionId, params.id))
		.get();

	const cashier = await db
		.select()
		.from(users)
		.where(eq(users.id, transaction.cashierId))
		.get();

	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, locals.tenant.id))
		.get();

	return {
		transaction,
		items,
		payment,
		cashier,
		settings: {
			currency: settings?.currency || 'IDR'
		}
	};
};
