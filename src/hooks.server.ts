import type { Handle } from '@sveltejs/kit';
import { getDB } from '$lib/db';
import { sessions, users, tenantUsers, tenants } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
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
