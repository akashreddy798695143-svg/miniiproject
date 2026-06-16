# Deploying ShopZone to Vercel

This guide walks you through deploying the ShopZone e-commerce app to Vercel.

## ✅ Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub](https://github.com) account (to host your code)
3. A PostgreSQL database (recommended: **Vercel Postgres** or **Neon** — both have free tiers)

## 📋 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - ShopZone ready for Vercel"

# Create a new repo on GitHub, then push
git remote add origin https://github.com/USERNAME/shopzone.git
git branch -M main
git push -u origin main
```

### Step 2: Create a PostgreSQL Database

#### Option A: Vercel Postgres (Recommended — easiest)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Select your GitHub repo
3. Go to **Storage** tab → Create Database → **Postgres** (free tier)
4. Copy the `DATABASE_URL` connection string

#### Option B: Neon (Free, serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like `postgres://default:xxxxx@ep-xxx.us-east-1.aws.neon.tech/verceldb?sslmode=require`)

#### Option C: Supabase (Free, with dashboard)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string → URI
4. Copy the connection string

### Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset**: Next.js (auto-detected)
4. **Build Command**: Already configured via `vercel.json`
5. **Install Command**: `bun install` (auto-detected)

### Step 4: Set Environment Variables

In the Vercel project settings, go to **Settings → Environment Variables** and add:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `your-postgresql-connection-string` | Production, Preview, Development |

**Important**: The connection string must be a PostgreSQL URL (starting with `postgres://` or `postgresql://`), NOT a SQLite file path.

### Step 5: Deploy

Click **Deploy** and wait for the build to complete (~2-3 minutes).

### Step 6: Initialize the Database

After deployment, visit your deployed site and call the seed endpoint to populate initial data:

```
https://your-app.vercel.app/api/seed
```

This will create:
- 25 categories with subcategories
- 25 brands
- 10 sellers
- 50+ products
- Sample reviews and coupons

## 🔧 How It Works

### Schema Switching

The project includes two Prisma schemas:

- **`prisma/schema.prisma`** — Uses **SQLite** for local development
- **`prisma/schema.vercel.prisma`** — Uses **PostgreSQL** for Vercel production

The `vercel.json` build command automatically switches to the PostgreSQL schema before building:

```json
{
  "buildCommand": "cp prisma/schema.vercel.prisma prisma/schema.prisma && npx prisma generate && next build"
}
```

This ensures:
- ✅ Local dev works with SQLite (no PostgreSQL setup needed locally)
- ✅ Vercel production uses PostgreSQL (serverless-compatible)

### What Was Made Vercel-Compatible

1. **Database**: SQLite → PostgreSQL (Vercel serverless functions have read-only filesystem)
2. **Removed**: `examples/` folder (caused build errors with socket.io-client)
3. **Excluded**: `skills/` and `mini-services/` from TypeScript compilation
4. **Config**: Removed `output: "standalone"` (not needed for Vercel)
5. **Images**: Added `remotePatterns` for `picsum.photos` and `images.unsplash.com`
6. **Build errors fixed**:
   - Added missing `banners` mock data in admin-panel.tsx
   - Fixed `filteredOrders` scope issue in seller-panel.tsx

## 🚀 Local Development

For local development, the project uses SQLite (no setup needed):

```bash
bun install
bun run db:push    # Creates SQLite database
bun run dev        # Starts dev server on http://localhost:3000
```

## 🔍 Troubleshooting

### "Database connection error" on Vercel

- Verify `DATABASE_URL` is set in Vercel Environment Variables
- Ensure the URL is PostgreSQL format: `postgres://...` or `postgresql://...`
- For Vercel Postgres: Use the "psql" connection string, not the pooled one
- For Neon/Supabase: Ensure `?sslmode=require` is in the URL

### Build fails on Vercel

- Check that `DATABASE_URL` is set for the Production environment
- Verify the build logs in Vercel dashboard
- The build command runs `prisma generate` which needs the schema

### "Table does not exist" errors

- Visit `/api/seed` endpoint first to create and populate tables
- Or run `npx prisma db push` locally against your production database

### Images not loading

- The `next.config.ts` allows `picsum.photos` and `images.unsplash.com`
- Add more domains to `remotePatterns` if needed

## 📦 Project Structure for Vercel

```
├── prisma/
│   ├── schema.prisma           # SQLite (local dev)
│   └── schema.vercel.prisma    # PostgreSQL (Vercel)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (serverless functions)
│   │   └── page.tsx            # Main SPA page
│   ├── components/             # React components
│   ├── lib/                    # Utilities (db client, mock data)
│   └── store/                  # Zustand stores
├── vercel.json                 # Vercel build config
├── next.config.ts              # Next.js config (image domains)
└── package.json
```

## 🎯 Post-Deployment Checklist

- [ ] Visit your Vercel URL to verify homepage loads
- [ ] Test registration with a new email
- [ ] Test login with registered credentials
- [ ] Test "Continue with Google" login
- [ ] Browse products by category
- [ ] Add items to cart
- [ ] Test checkout flow
- [ ] Verify user dashboard shows correct user data
- [ ] Test dark mode toggle
- [ ] Test AI chatbot

## 💡 Notes

- The Socket.IO mini-service in `/mini-services/` is **not deployed** to Vercel (it's a separate Node.js process). The app works without it — real-time features are simulated client-side.
- All product images use `picsum.photos` (random images by seed) and `images.unsplash.com` (real product photos).
- The app is a SPA (Single Page Application) — all routing happens client-side via Zustand state.
