# Detailed Use Cases

## 1. Authentication & Onboarding

### UC-1.1: Sign Up with Google OAuth
**Actor**: New User
**Precondition**: User has Google account
**Flow**:
1. User visits sign-up page
2. User clicks "Sign up with Google"
3. System redirects to Google OAuth
4. User grants permissions
5. System creates user account with Google ID
6. System prompts: "Create new business" or "Join existing business"
7. If create: User enters business name, system creates tenant with user as OWNER
8. If join: User enters invitation code
9. System redirects to dashboard

**Postcondition**: User is authenticated and has access to a tenant

### UC-1.2: Sign Up with Email/Password
**Actor**: New User
**Precondition**: None
**Flow**:
1. User visits sign-up page
2. User enters email, password, full name
3. System validates input (password strength, email format)
4. System creates user account with hashed password
5. System sends verification email
6. User clicks verification link in email
7. System marks email as verified
8. System prompts to create or join business
9. System redirects to dashboard

**Postcondition**: User account created, email verified, tenant assigned

### UC-1.3: Switch Tenant
**Actor**: Authenticated User (belongs to multiple tenants)
**Precondition**: User is logged in and has access to >1 tenant
**Flow**:
1. User clicks tenant selector in header/menu
2. System displays list of accessible tenants with roles
3. User selects different tenant
4. System updates session with new tenant_id
5. System refreshes dashboard with new tenant data

**Postcondition**: User is now operating in different tenant context

## 2. Product Management

### UC-2.1: Add New Product
**Actor**: OWNER or MANAGER
**Precondition**: User is authenticated with appropriate role
**Flow**:
1. User navigates to Products page
2. User clicks "Add Product"
3. User enters product details:
   - Name, SKU, Barcode (optional)
   - Category
   - Price, Cost
   - Description
   - Track inventory (yes/no)
   - Initial stock quantity
4. System validates input
5. System creates product record
6. If track_inventory=true, creates inventory record
7. System displays success message
8. Product appears in products list

**Postcondition**: New product is available for sale

### UC-2.2: Bulk Import Products (CSV)
**Actor**: OWNER or MANAGER
**Precondition**: User has CSV file with products
**Flow**:
1. User clicks "Import Products"
2. User uploads CSV file
3. System validates CSV format and data
4. System shows preview with validation errors (if any)
5. User confirms import
6. System creates all valid products
7. System displays import summary (success count, error count)
8. System provides downloadable error report if errors exist

**Postcondition**: Multiple products imported

### UC-2.3: Set Low Stock Alert
**Actor**: OWNER or MANAGER
**Precondition**: Product exists with track_inventory=true
**Flow**:
1. User navigates to product details
2. User sets low stock threshold (e.g., 10 units)
3. System saves threshold
4. When stock reaches threshold, system sends notification
5. Product shows "Low Stock" badge in product list

**Postcondition**: Automated low stock monitoring enabled

## 3. Sales Transaction

### UC-3.1: Process Sale (Happy Path)
**Actor**: CASHIER, MANAGER, or OWNER
**Precondition**: Products exist in inventory
**Flow**:
1. User opens new transaction screen
2. User scans barcode or searches for product
3. System adds product to cart with quantity 1
4. User adjusts quantity if needed
5. User repeats for all items
6. System calculates subtotal
7. User applies discount (optional)
8. System calculates tax based on tenant settings
9. System displays total
10. User selects payment method(s)
11. User enters payment amount(s)
12. System validates payment (total = sum of payments)
13. System processes transaction:
    - Creates transaction record
    - Creates transaction_items
    - Reduces inventory quantities
    - Creates payment records
14. System generates receipt number
15. System displays receipt preview
16. User prints or emails receipt
17. Transaction completes

**Postcondition**: Sale recorded, inventory updated, receipt generated

### UC-3.2: Split Payment
**Actor**: CASHIER
**Precondition**: Transaction total calculated
**Flow**:
1. User proceeds to payment
2. Customer wants to split payment (e.g., $50 cash + $50 card)
3. User clicks "Add Payment Method"
4. User selects CASH, enters $50
5. User clicks "Add Payment Method"
6. User selects CARD, enters $50
7. System validates total ($100 = $50 + $50)
8. System processes transaction with multiple payment records

**Postcondition**: Transaction completed with multiple payments

### UC-3.3: Apply Discount
**Actor**: CASHIER (if permitted), MANAGER, OWNER
**Precondition**: Transaction in progress
**Flow**:
1. User reviews cart
2. User clicks "Apply Discount"
3. User selects discount type:
   - Percentage off (e.g., 10%)
   - Fixed amount (e.g., $5 off)
4. User enters discount value
5. System recalculates subtotal and total
6. Discount appears on receipt

**Postcondition**: Discount applied to transaction

### UC-3.4: Void Transaction
**Actor**: MANAGER or OWNER
**Precondition**: Transaction exists with status=COMPLETED
**Flow**:
1. User searches for transaction by receipt number
2. User clicks "Void Transaction"
3. System prompts for confirmation and reason
4. User confirms
5. System updates transaction status to VOIDED
6. System restores inventory quantities
7. System records void action with timestamp and user

**Postcondition**: Transaction voided, inventory restored

### UC-3.5: Process Refund
**Actor**: MANAGER or OWNER
**Precondition**: Transaction exists with status=COMPLETED
**Flow**:
1. User searches for transaction
2. User clicks "Refund"
3. User selects items to refund (partial or full)
4. System calculates refund amount
5. User selects refund method (cash, card, store credit)
6. User confirms refund
7. System creates refund transaction (negative amounts)
8. System restores inventory for returned items
9. System prints refund receipt

**Postcondition**: Refund processed, inventory updated

## 4. Customer Management

### UC-4.1: Add Customer
**Actor**: Any authenticated user
**Precondition**: None
**Flow**:
1. User clicks "Add Customer"
2. User enters customer details (name, email, phone, address)
3. System validates email format
4. System creates customer record
5. System assigns initial loyalty points (0)

**Postcondition**: Customer available for transactions

### UC-4.2: Apply Loyalty Points
**Actor**: CASHIER
**Precondition**: Customer exists, transaction in progress
**Flow**:
1. User selects customer for transaction
2. System displays customer's available loyalty points
3. User asks customer if they want to redeem points
4. User applies points (e.g., 100 points = $10 off)
5. System reduces discount from total
6. After transaction, system adds earned points (e.g., $1 spent = 1 point)
7. System updates customer loyalty balance

**Postcondition**: Loyalty points redeemed and earned

## 5. Reporting

### UC-5.1: Generate Daily Sales Report
**Actor**: MANAGER or OWNER
**Precondition**: Sales transactions exist
**Flow**:
1. User navigates to Reports
2. User selects "Daily Sales Report"
3. User selects date
4. System aggregates transactions for date:
   - Total sales
   - Total transactions
   - Average transaction value
   - Top selling products
   - Sales by payment method
   - Sales by cashier
5. System displays report
6. User can export to PDF or CSV

**Postcondition**: Sales report generated

### UC-5.2: View Product Performance
**Actor**: MANAGER or OWNER
**Precondition**: Sales transactions exist
**Flow**:
1. User selects "Product Performance Report"
2. User selects date range
3. System calculates for each product:
   - Units sold
   - Revenue
   - Profit (if cost data available)
   - Percentage of total sales
4. System sorts by revenue (descending)
5. System displays top 10 products with charts

**Postcondition**: Product insights available

## 6. Inventory Management

### UC-6.1: Adjust Inventory (Manual)
**Actor**: MANAGER or OWNER
**Precondition**: Product exists
**Flow**:
1. User navigates to product inventory
2. User clicks "Adjust Stock"
3. User selects reason (received shipment, damaged goods, count correction)
4. User enters quantity adjustment (+/-)
5. System updates inventory quantity
6. System logs adjustment with timestamp, user, and reason

**Postcondition**: Inventory updated and audited

### UC-6.2: View Low Stock Products
**Actor**: MANAGER or OWNER
**Precondition**: Products have low stock thresholds set
**Flow**:
1. User navigates to Inventory page
2. User clicks "Low Stock" filter
3. System displays products where quantity ≤ threshold
4. Products sorted by urgency (lowest quantity first)
5. User can directly reorder or adjust stock

**Postcondition**: User aware of products needing restock

## 7. User Management

### UC-7.1: Invite User to Tenant
**Actor**: OWNER
**Precondition**: Tenant exists
**Flow**:
1. OWNER navigates to Team/Users page
2. OWNER clicks "Invite User"
3. OWNER enters invitee email and selects role (MANAGER or CASHIER)
4. System generates unique invitation token
5. System sends invitation email
6. Invitee clicks link
7. If invitee has account: System adds to tenant_users
8. If new user: System prompts to sign up first, then joins tenant
9. OWNER sees new user in team list

**Postcondition**: User added to tenant with assigned role

### UC-7.2: Change User Role
**Actor**: OWNER
**Precondition**: User is member of tenant
**Flow**:
1. OWNER views team members
2. OWNER selects user
3. OWNER changes role (e.g., CASHIER → MANAGER)
4. System updates tenant_users record
5. System displays confirmation
6. User's permissions update immediately

**Postcondition**: User role changed

### UC-7.3: Deactivate User
**Actor**: OWNER
**Precondition**: User is member of tenant
**Flow**:
1. OWNER selects user
2. OWNER clicks "Deactivate"
3. System sets is_active=false in tenant_users
4. User can no longer access this tenant
5. User's existing sessions for this tenant invalidated

**Postcondition**: User access revoked

## 8. Business Settings

### UC-8.1: Configure Tax Rate
**Actor**: OWNER
**Precondition**: Tenant exists
**Flow**:
1. OWNER navigates to Settings
2. OWNER clicks "Tax Settings"
3. OWNER enters tax rate (e.g., 8.5%)
4. System validates (0-100)
5. System saves to tenant_settings
6. All future transactions use new tax rate

**Postcondition**: Tax rate updated

### UC-8.2: Customize Receipt
**Actor**: OWNER
**Precondition**: Tenant exists
**Flow**:
1. OWNER navigates to Settings > Receipts
2. OWNER uploads business logo
3. OWNER enters receipt footer text (e.g., "Thank you!")
4. OWNER previews receipt
5. System saves settings
6. All future receipts use custom template

**Postcondition**: Receipts customized

## Priority for Initial Development

**Phase 1 (MVP)**:
- UC-1.1, UC-1.2 (Authentication)
- UC-2.1 (Add Product)
- UC-3.1 (Process Sale)
- UC-5.1 (Daily Sales Report)

**Phase 2**:
- UC-7.1 (Invite Users)
- UC-4.1 (Add Customer)
- UC-3.3 (Apply Discount)
- UC-2.3 (Low Stock Alerts)

**Phase 3**:
- UC-3.4, UC-3.5 (Void/Refund)
- UC-2.2 (Bulk Import)
- UC-4.2 (Loyalty Points)
- UC-5.2 (Product Performance)

**Phase 4**:
- All remaining use cases
- Advanced features
