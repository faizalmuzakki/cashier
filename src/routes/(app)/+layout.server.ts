import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	// Require tenant selection
	if (!locals.tenant) {
		throw redirect(303, '/select-tenant');
	}

	return {
		user: locals.user,
		tenant: locals.tenant,
		role: locals.role
	};
};
