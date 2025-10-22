import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDB } from '$lib/db';
import { deleteSession } from '$lib/auth/session';

export const actions: Actions = {
	default: async ({ locals, platform, cookies }) => {
		if (locals.session && platform?.env?.DB) {
			const db = getDB(platform.env.DB);
			await deleteSession(db, locals.session.id, cookies);
		}
		
		throw redirect(303, '/auth/login');
	}
};
