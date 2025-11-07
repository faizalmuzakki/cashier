import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB, generateId } from '$lib/db';
import { users, tenants, tenantUsers, tenantSettings } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, validatePassword, validateEmail } from '$lib/auth/password';
import { createSession } from '$lib/auth/session';
import { createVerificationToken, sendVerificationEmail } from '$lib/auth/verification';
import { Google } from 'arctic';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	email: async ({ request, platform, cookies, url }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName')?.toString();
		const email = formData.get('email')?.toString()?.toLowerCase();
		const password = formData.get('password')?.toString();
		const businessName = formData.get('businessName')?.toString();

		if (!fullName || !email || !password || !businessName) {
			return fail(400, { error: 'All fields are required', fullName, email, businessName });
		}

		// Validate email
		if (!validateEmail(email)) {
			return fail(400, { error: 'Invalid email address', fullName, email, businessName });
		}

		// Validate password
		const passwordValidation = validatePassword(password);
		if (!passwordValidation.valid) {
			return fail(400, { error: passwordValidation.error, fullName, email, businessName });
		}

		const db = getDB(platform.env.DB);

		// Check if email already exists
		const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

		if (existingUser) {
			return fail(400, { error: 'Email already in use', fullName, email, businessName });
		}

		// Hash password
		const passwordHash = await hashPassword(password);

		// Create user, tenant, and tenant_user in transaction
		try {
			const userId = generateId();
			const tenantId = generateId();

			// Generate unique slug with collision checking
			let slug = businessName
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
				return fail(500, { error: 'Failed to generate unique slug. Please try again.', fullName, email, businessName });
			}

			// Create user
			await db.insert(users).values({
				id: userId,
				email,
				passwordHash,
				fullName,
				emailVerified: false
			});

			// Create tenant
			await db.insert(tenants).values({
				id: tenantId,
				name: businessName,
				slug
			});

			// Create tenant settings with IDR as default
			await db.insert(tenantSettings).values({
				id: generateId(),
				tenantId,
				currency: 'IDR',
				timezone: 'Asia/Jakarta',
				taxRate: 0.0
			});

			// Create tenant_user relationship with OWNER role
			await db.insert(tenantUsers).values({
				id: generateId(),
				tenantId,
				userId,
				role: 'OWNER',
				isActive: true
			});

			// Create verification token and send email
			const verificationToken = await createVerificationToken(db, userId);
			await sendVerificationEmail(email, verificationToken, url.origin);

			// Create session (allow login even before email verification)
			await createSession(db, userId, tenantId, cookies);

			// Redirect to dashboard with verification notice
			throw redirect(303, '/dashboard?verify=pending');
		} catch (error) {
			console.error('Signup error:', error);
			return fail(500, { error: 'Failed to create account. Please try again.', fullName, email, businessName });
		}
	},

	google: async ({ platform, url, cookies }) => {
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

		// Store state and code verifier in HTTP-only cookies for PKCE flow
		cookies.set('oauth_state', state, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 10 // 10 minutes
		});

		cookies.set('oauth_code_verifier', codeVerifier, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 10 // 10 minutes
		});

		const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

		throw redirect(303, authUrl.toString());
	}
};
