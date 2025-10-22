import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		tenant: locals.tenant,
		role: locals.role
	};
};
