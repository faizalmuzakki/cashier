import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDB } from '$lib/db';
import { tenants, tenantUsers, sessions } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { slugify } from '$lib/utils/slugify';

export const load: PageServerLoad = async ({ locals, platform }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	// If already has tenant in session, redirect to dashboard
	if (locals.tenant) {
		throw redirect(303, '/dashboard');
	}

	if (!platform?.env?.DB) {
		throw new Error('Database not available');
	}

	const db = getDB(platform.env.DB);

	// Fetch all tenants the user belongs to
	const userTenants = await db
		.select({
			tenant: tenants,
			tenantUser: tenantUsers
		})
		.from(tenantUsers)
		.innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
		.where(and(eq(tenantUsers.userId, locals.user.id), eq(tenantUsers.isActive, true)))
		.all();

	return {
		user: locals.user,
		tenants: userTenants.map((t) => ({
			id: t.tenant.id,
			name: t.tenant.name,
			slug: t.tenant.slug,
			role: t.tenantUser.role
		}))
	};
};

export const actions: Actions = {
	// Select existing tenant
	select: async ({ request, cookies, locals, platform }) => {
		if (!locals.user || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const db = getDB(platform.env.DB);
		const formData = await request.formData();
		const tenantId = formData.get('tenantId')?.toString();

		if (!tenantId) {
			return fail(400, { error: 'Tenant ID is required' });
		}

		// Verify user has access to this tenant
		const tenantUser = await db
			.select()
			.from(tenantUsers)
			.where(
				and(
					eq(tenantUsers.userId, locals.user.id),
					eq(tenantUsers.tenantId, tenantId),
					eq(tenantUsers.isActive, true)
				)
			)
			.get();

		if (!tenantUser) {
			return fail(403, { error: 'Access denied to this tenant' });
		}

		// Update session with tenant
		const sessionId = cookies.get('session_id');
		if (sessionId) {
			await db.update(sessions).set({ tenantId }).where(eq(sessions.id, sessionId)).run();
		}

		throw redirect(303, '/dashboard');
	},

	// Create new tenant
	create: async ({ request, cookies, locals, platform }) => {
		if (!locals.user || !platform?.env?.DB) {
			return fail(401, { error: 'Unauthorized' });
		}

		const db = getDB(platform.env.DB);
		const formData = await request.formData();
		const tenantName = formData.get('name')?.toString();

		if (!tenantName || tenantName.trim().length < 2) {
			return fail(400, { error: 'Business name must be at least 2 characters' });
		}

		try {
			// Generate unique slug
			const baseSlug = slugify(tenantName);
			let slug = baseSlug;
			let counter = 1;

			while (true) {
				const existing = await db.select().from(tenants).where(eq(tenants.slug, slug)).get();

				if (!existing) break;
				slug = `${baseSlug}-${counter}`;
				counter++;
			}

			// Create tenant
			const [newTenant] = await db
				.insert(tenants)
				.values({
					name: tenantName.trim(),
					slug
				})
				.returning();

			// Add user as owner
			await db.insert(tenantUsers).values({
				tenantId: newTenant.id,
				userId: locals.user.id,
				role: 'OWNER'
			});

			// Update session with new tenant
			const sessionId = cookies.get('session_id');
			if (sessionId) {
				await db
					.update(sessions)
					.set({ tenantId: newTenant.id })
					.where(eq(sessions.id, sessionId))
					.run();
			}

			throw redirect(303, '/dashboard');
		} catch (error) {
			console.error('Error creating tenant:', error);
			return fail(500, { error: 'Failed to create business' });
		}
	}
};
