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

	// Validate state and retrieve code verifier from cookies
	const storedState = cookies.get('oauth_state');
	const storedCodeVerifier = cookies.get('oauth_code_verifier');

	if (!storedState || !storedCodeVerifier || storedState !== state) {
		// Clear cookies and reject
		cookies.delete('oauth_state', { path: '/' });
		cookies.delete('oauth_code_verifier', { path: '/' });
		throw redirect(303, '/auth/login?error=invalid_state');
	}

	// Clear the cookies after validation
	cookies.delete('oauth_state', { path: '/' });
	cookies.delete('oauth_code_verifier', { path: '/' });

	try {
		const google = new Google(
			platform.env.GOOGLE_CLIENT_ID,
			platform.env.GOOGLE_CLIENT_SECRET,
			platform.env.GOOGLE_REDIRECT_URI || `${url.origin}/auth/callback/google`
		);

		// Use code verifier for PKCE flow
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
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

			// Generate unique slug with collision checking
			let slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');

			// Check for slug uniqueness and append random string if needed
			let slugExists = true;
			let attempts = 0;
			while (slugExists && attempts < 5) {
				const randomSuffix = Math.random().toString(36).substring(2, 10);
				const potentialSlug = slug + '-' + randomSuffix;

				const existingTenant = await db
					.select()
					.from(tenants)
					.where(eq(tenants.slug, potentialSlug))
					.get();

				if (!existingTenant) {
					slug = potentialSlug;
					slugExists = false;
				}
				attempts++;
			}

			if (slugExists) {
				throw redirect(303, '/auth/login?error=slug_generation_failed');
			}

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
