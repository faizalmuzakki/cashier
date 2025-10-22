# Cashier - Point of Sale Application

A modern, mobile-friendly POS (Point of Sale) system built with SvelteKit and deployed on Cloudflare Pages.

## Features

- 📱 **Mobile-First Design**: Optimized for tablets and mobile devices
- 🏢 **Multi-Tenancy**: Support multiple businesses in one app
- 🔐 **Flexible Authentication**: Google OAuth + Email/Password
- 💰 **Indonesian Rupiah Support**: Default currency with proper formatting
- ⚡ **Fast & Scalable**: Powered by Cloudflare Pages & D1
- 🎨 **Modern UI**: TailwindCSS with mobile-optimized components

## Tech Stack

- **Frontend**: SvelteKit 2.0 + TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Styling**: TailwindCSS 4.0
- **Authentication**: Custom auth with bcrypt + Google OAuth (Arctic)
- **Deployment**: Cloudflare Pages

## Project Structure

```
cashier/
├── docs/                   # Documentation
│   ├── authentication.md   # Auth strategy & flows
│   ├── schema.md          # Database schema
│   ├── use-cases.md       # Detailed use cases
│   └── deployment.md      # Deployment guide
├── src/
│   ├── lib/
│   │   ├── auth/          # Authentication utilities
│   │   ├── db/            # Database schema & client
│   │   ├── utils/         # Helper functions (currency, date, etc.)
│   │   └── components/    # Reusable Svelte components
│   └── routes/            # SvelteKit routes
├── migrations/            # Database migrations
├── drizzle.config.ts      # Drizzle ORM config
└── wrangler.toml          # Cloudflare config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Wrangler CLI (Cloudflare)
- Cloudflare account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create Cloudflare D1 database:
```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create cashier-db

# Copy the database ID from output and update wrangler.toml
```

4. Generate and run database migrations:
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

### Development

```bash
# Run development server
npm run dev

# For local development with D1
npm run cf:dev
```

### Deployment

See [docs/deployment.md](./docs/deployment.md) for detailed deployment instructions.

```bash
# Build and deploy to Cloudflare Pages
npm run cf:deploy
```

## Key Features

### Multi-Tenancy
- Isolated data per business
- Custom settings (tax rates optional, IDR currency)
- Role-based access (Owner, Manager, Cashier)

### Mobile Optimization
- Touch-friendly UI (44x44px minimum targets)
- Responsive design (phones, tablets, desktop)
- Fast loading and minimal data usage

### Currency & Localization
- Default: Indonesian Rupiah (IDR)
- Indonesian timezone (Asia/Jakarta)
- Optional tax rates

## Documentation

- [Authentication Strategy](./docs/authentication.md)
- [Database Schema](./docs/schema.md)
- [Use Cases](./docs/use-cases.md)
- [Deployment Guide](./docs/deployment.md)

## Development Roadmap

### Phase 1 (MVP) - ✅ COMPLETE!
- [x] Project setup & configuration
- [x] Database schema (multi-tenant with D1)
- [x] Authentication system (login/signup)
- [x] Session management
- [x] Dashboard with statistics
- [x] Mobile-friendly navigation
- [x] Product management (list, add, search)
- [x] Sales transaction UI (POS)
- [x] Basic daily sales report
- [x] Receipt generation
- [x] Logout functionality

### Phase 2 - ✅ COMPLETE!
- [x] Edit product (update price, stock, details)
- [x] Delete product
- [x] Customer management (add, list, search)
- [x] Customer selection in sales
- [x] Discount support (percentage & fixed amount)
- [x] Enhanced sales calculations

### Phase 3-4
See [docs/use-cases.md](./docs/use-cases.md) for detailed roadmap.

## Current Status

✅ **Phase 1 & 2 Complete!**:
- **Authentication**: Login, Signup, Logout, Session management
- **Dashboard**: Stats (sales, transactions, products, low stock), Quick actions
- **Products**: List, Add, **Edit**, **Delete**, Search/filter, Inventory tracking
- **Customers**: **Add**, **List**, **Search**, Loyalty points tracking
- **Sales/POS**: Product search, Cart, **Customer selection**, **Discounts** (% & fixed), Checkout, Payment
- **Receipts**: Digital receipt with print support
- **Reports**: Daily sales report, Transaction history
- **Mobile-First**: Responsive design, Touch-friendly UI, Bottom navigation
- **Multi-Tenant**: Business isolation, Role-based access (Owner/Manager/Cashier)
- **Indonesian Localization**: Rupiah (IDR) currency, Asia/Jakarta timezone

## Quick Start

1. **Install dependencies**: `npm install`
2. **Create D1 database**: `npx wrangler d1 create cashier-db`
3. **Update wrangler.toml** with your database ID
4. **Generate migrations**: `npm run db:generate`
5. **Run migrations**: `npm run db:migrate`
6. **Start dev server**: `npm run cf:dev`
7. **Open** `http://localhost:8788`

---

Built with ❤️ using SvelteKit and Cloudflare
