import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { verifyEmail } from '$lib/auth/verification';

export const load: PageServerLoad = async ({ url, platform }) => {
	if (!platform?.env?.DB) {
		throw redirect(303, '/auth/login?error=database_unavailable');
	}

	const token = url.searchParams.get('token');

	if (!token) {
		return {
			success: false,
			message: 'Invalid verification link'
		};
	}

	const db = getDB(platform.env.DB);
	const success = await verifyEmail(db, token);

	if (success) {
		return {
			success: true,
			message: 'Email verified successfully! You can now log in.'
		};
	} else {
		return {
			success: false,
			message: 'Invalid or expired verification link'
		};
	}
};
