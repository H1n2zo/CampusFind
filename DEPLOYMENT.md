# CampusFind — Vercel Deployment Guide

## What Changed (PHP → Next.js)

| Original PHP         | Next.js Equivalent               |
|----------------------|----------------------------------|
| `includes/db.php`    | `lib/db.ts` (Neon serverless)   |
| `includes/functions.php` | `lib/utils.ts` + API routes |
| `admin/*.php`        | `app/admin/*.tsx` (React pages) |
| `ajax/*.php`         | `app/api/**/*.ts` (API routes)  |
| `uploads/` folder    | Cloudinary (cloud image storage)|
| Session (PHP)        | `iron-session` (encrypted cookie)|
| MySQL                | Neon Postgres (serverless)      |
| `style.css`          | `app/globals.css`               |

---

## Step 1 — Set Up Neon (Free Postgres Database)

1. Go to **https://neon.tech** and create a free account
2. Create a new project → name it `campusfind`
3. Go to **Dashboard → Connection Details**
4. Copy the **Connection string** (starts with `postgres://...`)

---

## Step 2 — Set Up Cloudinary (Free Image Hosting)

1. Go to **https://cloudinary.com** and create a free account
2. Go to **Dashboard**
3. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 3 — Deploy to Vercel

1. Push this folder to a **GitHub repository**
2. Go to **https://vercel.com** → Import your repo
3. In the Vercel project settings, add these **Environment Variables**:

```
DATABASE_URL         = postgres://...  (from Neon)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY   = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
SESSION_SECRET       = any_long_random_string_32_chars_min
```

4. Click **Deploy** — Vercel will build and deploy automatically

---

## Step 4 — Run Database Migrations

After deploying (or locally with `.env.local` set up):

```bash
npm install
node lib/migrate.js
```

This creates the `admins`, `items`, and `claim_requests` tables in Neon.

---

## Step 5 — Create Your Admin Account

Visit: `https://your-app.vercel.app/admin/register`

Create your admin account there.

> **Security tip:** After creating your account, you can protect `/admin/register`
> by adding a secret key check, or simply don't share the URL publicly.

---

## Local Development

```bash
# 1. Copy env file and fill in your credentials
cp .env.local.example .env.local

# 2. Install dependencies
npm install

# 3. Run migrations (once)
node lib/migrate.js

# 4. Start dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
campusfind/
├── app/
│   ├── page.tsx              ← Public board
│   ├── globals.css           ← All styles
│   ├── layout.tsx
│   ├── admin/
│   │   ├── page.tsx          ← Pending review
│   │   ├── approved/page.tsx
│   │   ├── claims/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── item/[id]/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── api/
│       ├── items/route.ts    ← GET list, POST new
│       ├── items/[id]/route.ts ← GET detail, PATCH actions
│       ├── claims/route.ts
│       ├── stats/route.ts
│       ├── upload/route.ts   ← Cloudinary upload
│       └── auth/
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── register/route.ts
│           └── me/route.ts
├── components/
│   ├── AdminSidebar.tsx
│   └── AdminNav.tsx
├── lib/
│   ├── db.ts                 ← Neon connection
│   ├── migrate.js            ← Run once to create tables
│   ├── session.ts            ← iron-session config
│   └── utils.ts              ← Helpers & categories
├── .env.local.example        ← Copy to .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Free Tier Limits

| Service    | Free Tier                              |
|------------|----------------------------------------|
| Vercel     | Unlimited deploys, 100GB bandwidth/mo  |
| Neon       | 0.5GB storage, 190hr compute/mo        |
| Cloudinary | 25 credits/mo (~25,000 transformations)|

All three free tiers are more than enough for a campus lost & found board.
