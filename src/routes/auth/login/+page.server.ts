import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { users, tenantUsers } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyPassword } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { Google } from 'arctic';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	email: async ({ request, platform, cookies }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const db = getDB(platform.env.DB);

		// Find user by email
		const user = await db.select().from(users).where(eq(users.email, email)).get();

		if (!user || !user.passwordHash) {
			return fail(400, { error: 'Invalid email or password' });
		}

		// Verify password
		const validPassword = await verifyPassword(password, user.passwordHash);

		if (!validPassword) {
			return fail(400, { error: 'Invalid email or password' });
		}

		// Check if user has any tenants
		const userTenants = await db
			.select()
			.from(tenantUsers)
			.where(and(eq(tenantUsers.userId, user.id), eq(tenantUsers.isActive, true)))
			.all();

		const tenantId = userTenants.length > 0 ? userTenants[0].tenantId : null;

		// Create session
		await createSession(db, user.id, tenantId, cookies);

		throw redirect(303, tenantId ? '/dashboard' : '/select-tenant');
	},

	google: async ({ platform, url }) => {
		if (!platform?.env?.GOOGLE_CLIENT_ID || !platform?.env?.GOOGLE_CLIENT_SECRET) {
			return fail(500, { error: 'Google OAuth not configured' });
		}

		const google = new Google(
			platform.env.GOOGLE_CLIENT_ID,
			platform.env.GOOGLE_CLIENT_SECRET,
			platform.env.GOOGLE_REDIRECT_URI || `${url.origin}/auth/callback/google`
		);

		const state = crypto.randomUUID();
		const codeVerifier = crypto.randomUUID();
		const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

		throw redirect(303, authUrl.toString());
	}
};
