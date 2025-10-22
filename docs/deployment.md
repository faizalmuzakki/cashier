# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- Git repository (optional, but recommended)

## 1. Initial Setup

### Install Dependencies

```bash
npm install
```

### Set Up Wrangler (Cloudflare CLI)

```bash
# Login to Cloudflare
npx wrangler login
```

## 2. Create Cloudflare D1 Database

```bash
npx wrangler d1 create cashier-db
```

Copy the `database_id` from output and update `wrangler.toml`.

## 3. Run Database Migrations

```bash
# Generate migrations
npm run db:generate

# Apply to production
npm run db:migrate
```

## 4. Configure Environment Variables

Create `.dev.vars` for local development:
```
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:8788/auth/callback/google
SESSION_SECRET=your-secret
```

## 5. Deploy

```bash
npm run cf:deploy
```

See full documentation at: https://developers.cloudflare.com/pages/
