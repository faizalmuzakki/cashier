import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user) {
		throw redirect(302, '/login');
	}
	return event.locals.user;
}

export function requireTenant(event: RequestEvent) {
	if (!event.locals.tenant) {
		throw redirect(302, '/select-tenant');
	}
	return event.locals.tenant;
}

export function requireRole(event: RequestEvent, allowedRoles: ('OWNER' | 'MANAGER' | 'CASHIER')[]) {
	const user = requireAuth(event);
	const tenant = requireTenant(event);

	if (!event.locals.role || !allowedRoles.includes(event.locals.role)) {
		throw redirect(302, '/unauthorized');
	}

	return { user, tenant, role: event.locals.role };
}

export function isOwner(event: RequestEvent): boolean {
	return event.locals.role === 'OWNER';
}

export function isManager(event: RequestEvent): boolean {
	return event.locals.role === 'MANAGER';
}

export function isCashier(event: RequestEvent): boolean {
	return event.locals.role === 'CASHIER';
}

export function canManageProducts(event: RequestEvent): boolean {
	return event.locals.role === 'OWNER' || event.locals.role === 'MANAGER';
}

export function canManageUsers(event: RequestEvent): boolean {
	return event.locals.role === 'OWNER';
}

export function canViewReports(event: RequestEvent): boolean {
	return event.locals.role === 'OWNER' || event.locals.role === 'MANAGER';
}
