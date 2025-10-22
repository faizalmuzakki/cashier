/**
 * Format currency for Indonesian Rupiah (default) or other currencies
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
	if (currency === 'IDR') {
		// Indonesian Rupiah formatting
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Other currencies
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	}).format(amount);
}

/**
 * Format number for display (e.g., quantity, stock levels)
 */
export function formatNumber(value: number): string {
	return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Parse currency input (remove formatting, convert to number)
 */
export function parseCurrency(value: string): number {
	// Remove all non-digit characters except decimal point
	const cleaned = value.replace(/[^\d.]/g, '');
	return parseFloat(cleaned) || 0;
}
