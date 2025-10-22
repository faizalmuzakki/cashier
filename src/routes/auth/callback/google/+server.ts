import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Google } from 'arctic';
import { getDB, generateId } from '$lib/db';
import { users, tenants, tenantUsers, tenantSettings } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '$lib/auth/session';

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	if (!platform?.env?.DB || !platform?.env?.GOOGLE_CLIENT_ID || !platform?.env?.GOOGLE_CLIENT_SECRET) {
		throw redirect(303, '/auth/login?error=oauth_not_configured');
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		throw redirect(303, '/auth/login?error=invalid_oauth');
	}

	try {
		const google = new Google(
			platform.env.GOOGLE_CLIENT_ID,
			platform.env.GOOGLE_CLIENT_SECRET,
			platform.env.GOOGLE_REDIRECT_URI || `${url.origin}/auth/callback/google`
		);

		const tokens = await google.validateAuthorizationCode(code);
		const accessToken = tokens.accessToken();

		// Fetch user info from Google
		const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch user info');
		}

		const googleUser = await response.json();
		const { id: googleId, email, name } = googleUser;

		const db = getDB(platform.env.DB);

		// Check if user exists by Google ID or email
		let user = await db
			.select()
			.from(users)
			.where(eq(users.googleId, googleId))
			.get();

		if (!user) {
			user = await db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.get();
		}

		// New user - create account and tenant
		if (!user) {
			const userId = generateId();
			const tenantId = generateId();
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 7);

			// Create user
			await db.insert(users).values({
				id: userId,
				email,
				passwordHash: null,
				fullName: name,
				googleId,
				emailVerified: true // Google accounts are pre-verified
			});

			// Create default tenant
			await db.insert(tenants).values({
				id: tenantId,
				name: `${name}'s Business`,
				slug
			});

			// Create tenant settings
			await db.insert(tenantSettings).values({
				id: generateId(),
				tenantId,
				currency: 'IDR',
				timezone: 'Asia/Jakarta',
				taxRate: 0.0
			});

			// Create tenant_user relationship
			await db.insert(tenantUsers).values({
				id: generateId(),
				tenantId,
				userId,
				role: 'OWNER',
				isActive: true
			});

			// Create session
			await createSession(db, userId, tenantId, cookies);

			throw redirect(303, '/dashboard');
		}

		// Existing user - update Google ID if not set
		if (!user.googleId) {
			await db
				.update(users)
				.set({ 
					googleId,
					emailVerified: true 
				})
				.where(eq(users.id, user.id));
		}

		// Get user's tenants
		const userTenants = await db
			.select()
			.from(tenantUsers)
			.where(eq(tenantUsers.userId, user.id))
			.all();

		const tenantId = userTenants.length > 0 ? userTenants[0].tenantId : null;

		// Create session
		await createSession(db, user.id, tenantId, cookies);

		throw redirect(303, tenantId ? '/dashboard' : '/select-tenant');
	} catch (error) {
		console.error('OAuth callback error:', error);
		throw redirect(303, '/auth/login?error=oauth_failed');
	}
};
