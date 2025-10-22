import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { products, inventory, transactions, transactionItems, payments, tenantSettings } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return {
			products: [],
			customers: [],
			settings: { currency: 'IDR', taxRate: 0 }
		};
	}

	const db = getDB(platform.env.DB);
	const tenantId = locals.tenant.id;

	const settings = await db
		.select()
		.from(tenantSettings)
		.where(eq(tenantSettings.tenantId, tenantId))
		.get();

	const allProducts = await db
		.select({
			id: products.id,
			name: products.name,
			sku: products.sku,
			barcode: products.barcode,
			price: products.price,
			inventory: {
				quantity: inventory.quantity
			}
		})
		.from(products)
		.leftJoin(inventory, eq(inventory.productId, products.id))
		.where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
		.all();

	const { customers } = await import('$lib/db/schema');
	const allCustomers = await db
		.select()
		.from(customers)
		.where(eq(customers.tenantId, tenantId))
		.all();

	return {
		products: allProducts,
		customers: allCustomers,
		settings: {
			currency: settings?.currency || 'IDR',
			taxRate: settings?.taxRate || 0
		}
	};
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		if (!platform?.env?.DB || !locals.tenant || !locals.user) {
			return fail(500, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const cartData = formData.get('cartData')?.toString();
		const customerId = formData.get('customerId')?.toString();
		const subtotal = parseFloat(formData.get('subtotal')?.toString() || '0');
		const discountAmount = parseFloat(formData.get('discountAmount')?.toString() || '0');
		const taxAmount = parseFloat(formData.get('taxAmount')?.toString() || '0');
		const total = parseFloat(formData.get('total')?.toString() || '0');
		const paymentMethod = formData.get('paymentMethod')?.toString();

		if (!cartData || !paymentMethod) {
			return fail(400, { error: 'Missing required data' });
		}

		const cart = JSON.parse(cartData);
		if (cart.length === 0) {
			return fail(400, { error: 'Cart is empty' });
		}

		const db = getDB(platform.env.DB);
		const transactionId = generateId();
		const transactionNumber = 'TRX-' + Date.now();

		try {
			// Create transaction
			await db.insert(transactions).values({
				id: transactionId,
				tenantId: locals.tenant.id,
				locationId: null,
				customerId: customerId || null,
				cashierId: locals.user.id,
				transactionNumber,
				subtotal,
				discountAmount,
				taxAmount,
				total,
				status: 'COMPLETED',
				notes: null
			});

			// Create transaction items and update inventory
			for (const item of cart) {
				await db.insert(transactionItems).values({
					id: generateId(),
					transactionId,
					productId: item.productId,
					variantId: null,
					name: item.name,
					quantity: item.quantity,
					unitPrice: item.price,
					discountAmount: 0,
					total: item.price * item.quantity
				});

				// Update inventory (reduce stock)
				const inventoryRecord = await db
					.select()
					.from(inventory)
					.where(eq(inventory.productId, item.productId))
					.get();

				if (inventoryRecord) {
					await db
						.update(inventory)
						.set({
							quantity: inventoryRecord.quantity - item.quantity
						})
						.where(eq(inventory.id, inventoryRecord.id));
				}
			}

			// Create payment record
			await db.insert(payments).values({
				id: generateId(),
				transactionId,
				paymentMethod: paymentMethod as any,
				amount: total,
				referenceNumber: null
			});

			// Return success - could redirect to receipt page
			throw redirect(303, `/sales/receipt/${transactionId}`);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Transaction error:', error);
			return fail(500, { error: 'Failed to complete transaction' });
		}
	}
};
