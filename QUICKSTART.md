# Quick Start Guide

Welcome to the Cashier POS app! Follow these steps to get started.

## ✅ Installation Complete

You've already installed all dependencies. Here's what's ready:

- ✅ SvelteKit with TypeScript
- ✅ Cloudflare D1 database (ORM configured)
- ✅ TailwindCSS with mobile-first design
- ✅ Authentication system (login/signup)
- ✅ Dashboard layout

## 🚀 Next Steps

### 1. Set Up Cloudflare D1 Database

```bash
# Login to Cloudflare (opens browser)
npx wrangler login

# Create D1 database
npx wrangler d1 create cashier-db
```

Copy the `database_id` from the output and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "cashier-db"
database_id = "paste-your-id-here"  # 👈 Replace this
```

### 2. Generate Database Migrations

```bash
npm run db:generate
```

This creates SQL migration files in the `migrations/` folder.

### 3. Run Migrations

**For local development**:
```bash
npx wrangler d1 execute cashier-db --local --file=migrations/0001_*.sql
```

**For production**:
```bash
npm run db:migrate
```

### 4. Configure Environment Variables

Create a `.dev.vars` file (for local development):

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your values:
```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8788/auth/callback/google
SESSION_SECRET=generate-a-random-secret-here
```

**Generate a session secret**:
```bash
openssl rand -base64 32
```

### 5. Start Development Server

```bash
# With Cloudflare D1 support (recommended)
npm run cf:dev
```

Open [http://localhost:8788](http://localhost:8788)

## 📱 Testing the App

### Sign Up Flow

1. Go to `/auth/signup`
2. Fill in your details:
   - Full Name
   - Email
   - Password (min 8 chars, uppercase, lowercase, number)
   - Business Name
3. Click "Create Account"
4. You'll be redirected to the dashboard

### What You Can Do Now

- ✅ Sign up with email/password
- ✅ Login with existing account
- ✅ View dashboard (stats, quick actions)
- ✅ Mobile-friendly navigation

### What's Coming Next

- 🚧 Product management (add, edit, delete products)
- 🚧 Sales transaction UI (POS interface)
- 🚧 Reporting (daily sales, product performance)

## 🐛 Troubleshooting

### "Database not available" error

Make sure you've:
1. Created the D1 database
2. Updated `wrangler.toml` with the correct `database_id`
3. Run migrations

### Type checking

```bash
npm run check
```

### View D1 Database

```bash
# List all databases
npx wrangler d1 list

# Execute SQL query
npx wrangler d1 execute cashier-db --command="SELECT * FROM users"
```

## 📖 Documentation

- [Database Schema](./docs/schema.md) - Multi-tenant database design
- [Authentication](./docs/authentication.md) - Auth strategy & flows
- [Use Cases](./docs/use-cases.md) - Detailed feature requirements
- [Deployment](./docs/deployment.md) - Deploy to Cloudflare Pages

## 🎨 Key Features

### Mobile-First Design
- Touch-friendly buttons (44x44px minimum)
- Responsive layout (works on phone, tablet, desktop)
- Bottom navigation on mobile, sidebar on desktop

### Indonesian Rupiah (IDR)
- Default currency formatting
- Asia/Jakarta timezone
- Optional tax rates per business

### Multi-Tenancy
- Each business has isolated data
- Role-based access (Owner, Manager, Cashier)
- One user can manage multiple businesses

## 💡 Tips

- Use `npm run cf:dev` for local development with D1
- Use `npm run dev` for faster hot-reload (but no database)
- Type checking: `npm run check`
- Build: `npm run build`

Ready to continue building? Let's add product management next! 🚀
