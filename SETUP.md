# Quick Setup Guide

This guide will get you up and running with the Cashier POS app in minutes.

## What's Been Set Up

✅ **SvelteKit** project with TypeScript
✅ **Cloudflare Pages** adapter configured
✅ **Cloudflare D1** database schema (multi-tenant)
✅ **Drizzle ORM** for type-safe database queries
✅ **TailwindCSS 4** with mobile-first design
✅ **Authentication system** (bcrypt + Google OAuth ready)
✅ **Session management** with httpOnly cookies
✅ **Role-based access control** (Owner, Manager, Cashier)
✅ **Indonesian Rupiah** as default currency
✅ **Asia/Jakarta** timezone
✅ **Optional tax rates**

## Next Steps

### 1. Set Up Cloudflare D1 Database

```bash
# Login to Cloudflare
npx wrangler login

# Create production database
npx wrangler d1 create cashier-db
```

Copy the `database_id` from the output and update [wrangler.toml](./wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "cashier-db"
database_id = "paste-your-database-id-here"
```

### 2. Generate Database Schema

```bash
# Generate SQL migration files
npm run db:generate

# This creates files in migrations/ folder
```

### 3. Run Migrations

```bash
# Apply schema to D1 database
npm run db:migrate
```

### 4. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback` (development)
   - `https://your-app.pages.dev/auth/google/callback` (production)

6. Create `.env` file:

```bash
cp .env.example .env
```

7. Update `.env` with your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
SESSION_SECRET=generate-with-openssl-rand-base64-32
```

Generate session secret:
```bash
openssl rand -base64 32
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## What to Build Next

The foundation is ready! Now you need to implement the features:

### Phase 1 (MVP) - Recommended Order

1. **Authentication Pages** (`/login`, `/signup`)
   - Create login/signup forms
   - Implement Google OAuth callback
   - Tenant selection page
   - Create initial tenant flow

2. **Dashboard** (`/dashboard`)
   - Simple overview with stats
   - Quick access to main features

3. **Product Management** (`/products`)
   - List products
   - Add/edit product form
   - Categories (optional)

4. **POS Interface** (`/pos`)
   - Product search/selection
   - Shopping cart
   - Checkout flow
   - Payment processing
   - Receipt generation

5. **Basic Reports** (`/reports`)
   - Daily sales summary
   - Transaction history

### File Structure for Routes

```
src/routes/
├── +page.svelte                 # Landing page (done ✓)
├── +layout.svelte               # Root layout (done ✓)
├── login/
│   └── +page.svelte            # Login page
├── signup/
│   └── +page.svelte            # Signup page
├── auth/
│   └── google/
│       └── callback/
│           └── +server.ts      # OAuth callback handler
├── dashboard/
│   ├── +page.svelte            # Dashboard
│   └── +page.server.ts         # Load data
├── products/
│   ├── +page.svelte            # Product list
│   ├── +page.server.ts         # Load products
│   ├── new/
│   │   └── +page.svelte        # Add product form
│   └── [id]/
│       ├── +page.svelte        # Edit product
│       └── +page.server.ts     # Load product
├── pos/
│   ├── +page.svelte            # POS interface
│   └── +page.server.ts         # Handle transactions
└── reports/
    ├── +page.svelte            # Reports dashboard
    └── +page.server.ts         # Generate reports
```

### Sample Component Structure

```
src/lib/components/
├── auth/
│   ├── LoginForm.svelte
│   ├── SignupForm.svelte
│   └── GoogleAuthButton.svelte
├── layout/
│   ├── Header.svelte
│   ├── Sidebar.svelte
│   └── MobileNav.svelte
├── products/
│   ├── ProductCard.svelte
│   ├── ProductForm.svelte
│   └── ProductList.svelte
├── pos/
│   ├── Cart.svelte
│   ├── ProductSearch.svelte
│   ├── PaymentModal.svelte
│   └── Receipt.svelte
└── ui/
    ├── Button.svelte
    ├── Input.svelte
    ├── Modal.svelte
    └── Card.svelte
```

## Mobile Design Tips

Since this is mobile-first:

1. **Use large touch targets** (minimum 44x44px)
2. **Stack elements vertically** on small screens
3. **Use bottom navigation** for main actions on mobile
4. **Test on actual devices** (or Chrome DevTools mobile view)
5. **Optimize images** (use WebP, lazy loading)
6. **Consider offline support** (service workers)

## Example: Creating Login Page

Here's a quick example to get started:

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';

	let loading = false;
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="card">
			<h1 class="text-2xl font-bold mb-6">Login</h1>

			<form method="POST" action="?/login" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							class="input"
							required
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium mb-1">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							class="input"
							required
						/>
					</div>

					<button
						type="submit"
						class="btn btn-primary w-full"
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</div>
			</form>

			<div class="mt-4">
				<a href="/auth/google" class="btn btn-secondary w-full">
					Continue with Google
				</a>
			</div>

			<p class="mt-4 text-center text-sm">
				Don't have an account?
				<a href="/signup" class="text-primary-600 hover:underline">Sign up</a>
			</p>
		</div>
	</div>
</div>
```

## Deployment

When ready to deploy:

```bash
# Build the app
npm run build

# Deploy to Cloudflare Pages
npm run cf:deploy
```

See [docs/deployment.md](./docs/deployment.md) for complete deployment guide.

## Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run check           # Type check
npm run build           # Build for production

# Database
npm run db:generate     # Generate migrations
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio

# Cloudflare
npm run cf:dev          # Dev with Cloudflare bindings
npm run cf:deploy       # Deploy to Cloudflare Pages
```

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## Need Help?

- Check [docs/](./docs/) folder for detailed documentation
- Review [use-cases.md](./docs/use-cases.md) for feature flows
- See [authentication.md](./docs/authentication.md) for auth implementation

---

Happy coding! 🚀
