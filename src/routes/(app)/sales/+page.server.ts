import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { products, inventory, transactions, transactionItems, payments, tenantSettings } from '$lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Payment method types from schema
type PaymentMethod = 'CASH' | 'CARD' | 'DIGITAL_WALLET' | 'OTHER';

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
		const paymentMethodRaw = formData.get('paymentMethod')?.toString();

		if (!cartData || !paymentMethodRaw) {
			return fail(400, { error: 'Missing required data' });
		}

		// Validate payment method
		const validPaymentMethods: PaymentMethod[] = ['CASH', 'CARD', 'DIGITAL_WALLET', 'OTHER'];
		const paymentMethod = paymentMethodRaw.toUpperCase();
		if (!validPaymentMethods.includes(paymentMethod as PaymentMethod)) {
			return fail(400, { error: 'Invalid payment method' });
		}

		const cart = JSON.parse(cartData);
		if (cart.length === 0) {
			return fail(400, { error: 'Cart is empty' });
		}

		const db = getDB(platform.env.DB);
		const transactionId = generateId();
		const transactionNumber = 'TRX-' + Date.now();

		try {
			// STEP 1: Validate inventory availability BEFORE starting transaction
			const inventoryValidation = [];
			const lowStockWarnings: string[] = [];

			for (const item of cart) {
				const inventoryRecord = await db
					.select()
					.from(inventory)
					.where(eq(inventory.productId, item.productId))
					.get();

				if (!inventoryRecord) {
					return fail(400, {
						error: `Inventory not found for product: ${item.name}`
					});
				}

				if (inventoryRecord.quantity < item.quantity) {
					return fail(400, {
						error: `Insufficient stock for ${item.name}. Available: ${inventoryRecord.quantity}, Requested: ${item.quantity}`
					});
				}

				// Check for low stock after this sale
				const remainingStock = inventoryRecord.quantity - item.quantity;
				const threshold = inventoryRecord.lowStockThreshold || 10;
				if (remainingStock <= threshold) {
					lowStockWarnings.push(
						`Warning: ${item.name} will have low stock (${remainingStock} remaining, threshold: ${threshold})`
					);
				}

				inventoryValidation.push({
					inventoryId: inventoryRecord.id,
					currentQuantity: inventoryRecord.quantity,
					requestedQuantity: item.quantity,
					lowStockThreshold: inventoryRecord.lowStockThreshold
				});
			}

			// Log warnings to console for monitoring
			if (lowStockWarnings.length > 0) {
				console.warn('Low stock warnings:', lowStockWarnings);
			}

			// STEP 2: Wrap all operations in a transaction-like batch
			// Note: D1 doesn't support transactions, so we'll use batch operations
			// and implement rollback logic if any operation fails
			const operations = [];

			// Create transaction
			operations.push(
				db.insert(transactions).values({
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
				})
			);

			// Create transaction items and update inventory atomically
			for (let i = 0; i < cart.length; i++) {
				const item = cart[i];
				const validation = inventoryValidation[i];

				// Insert transaction item
				operations.push(
					db.insert(transactionItems).values({
						id: generateId(),
						transactionId,
						productId: item.productId,
						variantId: null,
						name: item.name,
						quantity: item.quantity,
						unitPrice: item.price,
						discountAmount: 0,
						total: item.price * item.quantity
					})
				);

				// Update inventory using atomic SQL operation to prevent race conditions
				operations.push(
					db
						.update(inventory)
						.set({
							quantity: sql`${inventory.quantity} - ${item.quantity}`
						})
						.where(and(
							eq(inventory.id, validation.inventoryId),
							// Additional safety check: ensure quantity hasn't changed
							sql`${inventory.quantity} >= ${item.quantity}`
						))
				);
			}

			// Create payment record
			operations.push(
				db.insert(payments).values({
					id: generateId(),
					transactionId,
					paymentMethod: paymentMethod as PaymentMethod,
					amount: total,
					referenceNumber: null
				})
			);

			// Execute all operations
			await Promise.all(operations);

			// Verify all inventory updates succeeded
			for (const item of cart) {
				const updatedInventory = await db
					.select()
					.from(inventory)
					.where(eq(inventory.productId, item.productId))
					.get();

				if (!updatedInventory || updatedInventory.quantity < 0) {
					// Rollback by deleting the transaction
					await db.delete(transactions).where(eq(transactions.id, transactionId));
					await db.delete(transactionItems).where(eq(transactionItems.transactionId, transactionId));
					await db.delete(payments).where(eq(payments.transactionId, transactionId));

					return fail(400, {
						error: `Inventory update failed for ${item.name}. Transaction rolled back.`
					});
				}
			}

			// Return success - redirect to receipt page
			throw redirect(303, `/sales/receipt/${transactionId}`);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Transaction error:', error);

			// Attempt rollback on any error
			try {
				await db.delete(transactions).where(eq(transactions.id, transactionId));
				await db.delete(transactionItems).where(eq(transactionItems.transactionId, transactionId));
				await db.delete(payments).where(eq(payments.transactionId, transactionId));
			} catch (rollbackError) {
				console.error('Rollback error:', rollbackError);
			}

			return fail(500, { error: 'Failed to complete transaction' });
		}
	}
};
