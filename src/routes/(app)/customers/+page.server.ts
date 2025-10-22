import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { customers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!platform?.env?.DB || !locals.tenant) {
		return { customers: [] };
	}

	const db = getDB(platform.env.DB);

	const allCustomers = await db
		.select()
		.from(customers)
		.where(eq(customers.tenantId, locals.tenant.id))
		.orderBy(customers.name)
		.all();

	return { customers: allCustomers };
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		if (!platform?.env?.DB || !locals.tenant) {
			return fail(500, { error: 'Not authorized' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const phone = formData.get('phone')?.toString();
		const address = formData.get('address')?.toString();

		if (!name) {
			return fail(400, { error: 'Customer name is required' });
		}

		const db = getDB(platform.env.DB);

		try {
			await db.insert(customers).values({
				id: generateId(),
				tenantId: locals.tenant.id,
				name,
				email: email || null,
				phone: phone || null,
				address: address || null,
				loyaltyPoints: 0
			});

			return { success: true };
		} catch (error) {
			console.error('Add customer error:', error);
			return fail(500, { error: 'Failed to add customer' });
		}
	}
};
