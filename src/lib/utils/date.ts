/**
 * Format date for Indonesian timezone (default)
 */
export function formatDate(date: Date | number, timezone: string = 'Asia/Jakarta'): string {
	const d = typeof date === 'number' ? new Date(date * 1000) : date;

	return new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'medium',
		timeZone: timezone
	}).format(d);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | number, timezone: string = 'Asia/Jakarta'): string {
	const d = typeof date === 'number' ? new Date(date * 1000) : date;

	return new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: timezone
	}).format(d);
}

/**
 * Format time only
 */
export function formatTime(date: Date | number, timezone: string = 'Asia/Jakarta'): string {
	const d = typeof date === 'number' ? new Date(date * 1000) : date;

	return new Intl.DateTimeFormat('id-ID', {
		timeStyle: 'short',
		timeZone: timezone
	}).format(d);
}

/**
 * Get start and end of day for date range queries
 */
export function getDateRange(date: Date) {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);

	const end = new Date(date);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}
