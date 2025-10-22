import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { verificationTokens, users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/db';

const VERIFICATION_TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

export function generateVerificationToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return encodeHexLowerCase(bytes);
}

export async function createVerificationToken(db: DrizzleD1Database, userId: string): Promise<string> {
	// Delete any existing verification tokens for this user
	await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));

	const token = generateVerificationToken();
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	await db.insert(verificationTokens).values({
		id: generateId(),
		userId,
		token: tokenHash,
		expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY)
	});

	return token;
}

export async function verifyEmail(db: DrizzleD1Database, token: string): Promise<boolean> {
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const verificationToken = await db
		.select()
		.from(verificationTokens)
		.where(eq(verificationTokens.token, tokenHash))
		.get();

	if (!verificationToken) {
		return false;
	}

	// Check if token is expired
	if (verificationToken.expiresAt < new Date()) {
		await db.delete(verificationTokens).where(eq(verificationTokens.id, verificationToken.id));
		return false;
	}

	// Mark email as verified
	await db
		.update(users)
		.set({ emailVerified: true })
		.where(eq(users.id, verificationToken.userId));

	// Delete the verification token
	await db.delete(verificationTokens).where(eq(verificationTokens.id, verificationToken.id));

	return true;
}

export async function sendVerificationEmail(email: string, token: string, origin: string): Promise<void> {
	const verificationUrl = `${origin}/auth/verify-email?token=${token}`;

	// For now, we'll just log the verification URL
	// In production, you'd integrate with an email service like Resend, SendGrid, etc.
	console.log(`
=========================================
EMAIL VERIFICATION
=========================================
To: ${email}
Subject: Verify your email address

Click the link below to verify your email address:
${verificationUrl}

This link will expire in 24 hours.
=========================================
	`);

	// TODO: Integrate with email service
	// Example with Resend:
	// await resend.emails.send({
	//   from: 'noreply@yourdomain.com',
	//   to: email,
	//   subject: 'Verify your email address',
	//   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
	// });
}
