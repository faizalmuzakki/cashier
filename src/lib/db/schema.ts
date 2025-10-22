import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Generate UUID for SQLite (D1)
export const generateId = () => crypto.randomUUID();

// Tenants (Businesses)
export const tenants = sqliteTable('tenants', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	logoUrl: text('logo_url'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Users
export const users = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(generateId),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash'),
	fullName: text('full_name').notNull(),
	googleId: text('google_id').unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// User-Tenant Relationships
export const tenantUsers = sqliteTable('tenant_users', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	role: text('role', { enum: ['OWNER', 'MANAGER', 'CASHIER'] }).notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Tenant Settings
export const tenantSettings = sqliteTable('tenant_settings', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.unique()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	businessAddress: text('business_address'),
	phone: text('phone'),
	email: text('email'),
	taxRate: real('tax_rate').default(0.0), // Optional - can be null or 0
	currency: text('currency').notNull().default('IDR'), // Default to Indonesian Rupiah
	timezone: text('timezone').notNull().default('Asia/Jakarta'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Locations
export const locations = sqliteTable('locations', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	address: text('address'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Categories (self-reference will be handled at query time)
export const categories = sqliteTable('categories', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	parentId: text('parent_id'), // References categories.id but can't use .references() to avoid circular ref
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Products
export const products = sqliteTable('products', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
	sku: text('sku'),
	barcode: text('barcode'),
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(),
	cost: real('cost'),
	trackInventory: integer('track_inventory', { mode: 'boolean' }).notNull().default(true),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Product Variants
export const productVariants = sqliteTable('product_variants', {
	id: text('id').primaryKey().$defaultFn(generateId),
	productId: text('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	variantName: text('variant_name').notNull(),
	sku: text('sku'),
	barcode: text('barcode'),
	price: real('price'),
	cost: real('cost'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Inventory
export const inventory = sqliteTable('inventory', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
	variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
	locationId: text('location_id').references(() => locations.id, { onDelete: 'cascade' }),
	quantity: integer('quantity').notNull().default(0),
	lowStockThreshold: integer('low_stock_threshold').default(10),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Customers
export const customers = sqliteTable('customers', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	email: text('email'),
	phone: text('phone'),
	address: text('address'),
	loyaltyPoints: integer('loyalty_points').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Transactions
export const transactions = sqliteTable('transactions', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	locationId: text('location_id').references(() => locations.id, { onDelete: 'set null' }),
	customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
	cashierId: text('cashier_id')
		.notNull()
		.references(() => users.id, { onDelete: 'restrict' }),
	transactionNumber: text('transaction_number').notNull(),
	subtotal: real('subtotal').notNull(),
	discountAmount: real('discount_amount').notNull().default(0.0),
	taxAmount: real('tax_amount').notNull().default(0.0),
	total: real('total').notNull(),
	status: text('status', { enum: ['DRAFT', 'COMPLETED', 'VOIDED', 'REFUNDED'] })
		.notNull()
		.default('COMPLETED'),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Transaction Items
export const transactionItems = sqliteTable('transaction_items', {
	id: text('id').primaryKey().$defaultFn(generateId),
	transactionId: text('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	productId: text('product_id').references(() => products.id, { onDelete: 'restrict' }),
	variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'restrict' }),
	name: text('name').notNull(),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull(),
	discountAmount: real('discount_amount').notNull().default(0.0),
	total: real('total').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Payments
export const payments = sqliteTable('payments', {
	id: text('id').primaryKey().$defaultFn(generateId),
	transactionId: text('transaction_id')
		.notNull()
		.references(() => transactions.id, { onDelete: 'cascade' }),
	paymentMethod: text('payment_method', {
		enum: ['CASH', 'CARD', 'DIGITAL_WALLET', 'OTHER']
	}).notNull(),
	amount: real('amount').notNull(),
	referenceNumber: text('reference_number'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Sessions for authentication
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	tenantId: text('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Email verification tokens
export const verificationTokens = sqliteTable('verification_tokens', {
	id: text('id').primaryKey().$defaultFn(generateId),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
	id: text('id').primaryKey().$defaultFn(generateId),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Tenant invitation tokens
export const invitationTokens = sqliteTable('invitation_tokens', {
	id: text('id').primaryKey().$defaultFn(generateId),
	tenantId: text('tenant_id')
		.notNull()
		.references(() => tenants.id, { onDelete: 'cascade' }),
	email: text('email').notNull(),
	role: text('role', { enum: ['MANAGER', 'CASHIER'] }).notNull(),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdBy: text('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});
