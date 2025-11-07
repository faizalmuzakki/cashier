import type { Handle } from '@sveltejs/kit';
import { getDB } from '$lib/db';
import { sessions, users, tenantUsers, tenants } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

// Simple in-memory rate limiter for auth endpoints
// Note: Cloudflare Workers are stateless, so this resets on each deployment
// For production, consider using Cloudflare's built-in rate limiting or Durable Objects
interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string, path: string): boolean {
	// Rate limit: 10 requests per minute for auth endpoints
	const key = `${ip}:${path}`;
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	// Clean up expired entries inline (no setInterval in Workers)
	if (entry && entry.resetAt < now) {
		rateLimitStore.delete(key);
	}

	const currentEntry = rateLimitStore.get(key);

	if (!currentEntry) {
		// New entry, create
		rateLimitStore.set(key, {
			count: 1,
			resetAt: now + 60 * 1000 // 1 minute
		});
		return true;
	}

	if (currentEntry.count >= 10) {
		return false; // Rate limit exceeded
	}

	currentEntry.count++;
	return true;
}

export const handle: Handle = async ({ event, resolve }) => {
	// Rate limiting for auth endpoints
	const authPaths = ['/auth/login', '/auth/signup', '/auth/resend-verification'];
	if (authPaths.some(path => event.url.pathname.startsWith(path)) && event.request.method === 'POST') {
		const ip = event.getClientAddress();
		if (!checkRateLimit(ip, event.url.pathname)) {
			throw error(429, 'Too many requests. Please try again later.');
		}
	}
	// Initialize locals
	event.locals.user = null;
	event.locals.tenant = null;
	event.locals.role = null;
	event.locals.session = null;

	// Get session cookie
	const sessionId = event.cookies.get('session_id');

	if (sessionId && event.platform?.env?.DB) {
		const db = getDB(event.platform.env.DB);

		try {
			// Fetch session with user data
			const sessionData = await db
				.select({
					session: sessions,
					user: users,
					tenant: tenants,
					tenantUser: tenantUsers
				})
				.from(sessions)
				.innerJoin(users, eq(sessions.userId, users.id))
				.leftJoin(tenants, eq(sessions.tenantId, tenants.id))
				.leftJoin(
					tenantUsers,
					and(eq(tenantUsers.userId, users.id), eq(tenantUsers.tenantId, sessions.tenantId!))
				)
				.where(eq(sessions.id, sessionId))
				.get();

			if (sessionData) {
				// Check if session is expired
				const now = new Date();
				if (sessionData.session.expiresAt > now) {
					event.locals.session = {
						id: sessionData.session.id,
						expiresAt: sessionData.session.expiresAt
					};

					event.locals.user = {
						id: sessionData.user.id,
						email: sessionData.user.email,
						fullName: sessionData.user.fullName
					};

					if (sessionData.tenant && sessionData.tenantUser) {
						event.locals.tenant = {
							id: sessionData.tenant.id,
							name: sessionData.tenant.name,
							slug: sessionData.tenant.slug
						};

						event.locals.role = sessionData.tenantUser.role;
					}
				} else {
					// Session expired, delete it
					await db.delete(sessions).where(eq(sessions.id, sessionId));
					event.cookies.delete('session_id', { path: '/' });
				}
			}
		} catch (error) {
			console.error('Session verification error:', error);
		}
	}

	return resolve(event);
};
