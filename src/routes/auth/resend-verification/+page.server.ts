import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDB } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { createVerificationToken, sendVerificationEmail } from '$lib/auth/verification';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already logged in and verified
	if (locals.user && locals.user.emailVerified) {
		throw redirect(303, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, platform, url }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		const db = getDB(platform.env.DB);

		// Find user by email
		const user = await db.select().from(users).where(eq(users.email, email)).get();

		// Always return success even if user doesn't exist (security best practice)
		if (!user) {
			return {
				success: true,
				message: 'If an account exists with this email, a verification link has been sent.'
			};
		}

		// If already verified, inform user
		if (user.emailVerified) {
			return {
				success: true,
				message: 'This email is already verified. You can log in now.'
			};
		}

		// Create new verification token and send email
		const token = await createVerificationToken(db, user.id);
		await sendVerificationEmail(email, token, url.origin);

		return {
			success: true,
			message: 'If an account exists with this email, a verification link has been sent.'
		};
	}
};
