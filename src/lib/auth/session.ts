import type { Cookies } from '@sveltejs/kit';
import type { DB } from '$lib/db';
import { sessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export async function createSession(
	db: DB,
	userId: string,
	tenantId: string | null,
	cookies: Cookies
) {
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		tenantId,
		expiresAt
	});

	cookies.set('session_id', sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: SESSION_DURATION / 1000
	});

	return sessionId;
}

export async function deleteSession(db: DB, sessionId: string, cookies: Cookies) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
	cookies.delete('session_id', { path: '/' });
}

export async function updateSessionTenant(
	db: DB,
	sessionId: string,
	tenantId: string | null
): Promise<void> {
	await db.update(sessions).set({ tenantId }).where(eq(sessions.id, sessionId));
}
