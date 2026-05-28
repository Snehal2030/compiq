# CompIQ — Compensation Intelligence for Indian Tech

> Know your worth. Down to the level.

CompIQ is a compensation intelligence platform for Indian tech professionals. Compare total compensation by **level**, role, and company — because levels matter more than job titles.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + CSS variables
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Deployment**: Vercel + Neon / Render

## Core Principles
1. **Levels > Titles** — Schema stores `level` (SDE-1, SDE-2, Staff...) + `levelOrder` (int) for true comparison
2. **Total Compensation** — Every entry: `baseSalary` + `bonus` + `stockPerYear` = `totalComp`
3. **Company Normalization** — `normalizedName` deduplicates "Google India" and "google"
4. **Validation** — Server validates ranges, missing fields, duplicates. Missing bonus/stock defaults to 0

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/compiq.git
cd compiq
npm install
cp .env.example .env
# Edit .env: add DATABASE_URL and JWT_SECRET
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

## GitHub Upload

```bash
git init
git add .
git commit -m "feat: initial CompIQ"
# Create repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/compiq.git
git branch -M main
git push -u origin main
```

## Deploy on Render

1. **New PostgreSQL** on render.com → copy External Database URL
2. **New Web Service** → connect GitHub repo
   - Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start Command: `npm start`
   - Env vars: `DATABASE_URL`, `JWT_SECRET=any-random-string`, `NODE_ENV=production`
3. After deploy → Shell → run seed command

## Deploy on Vercel + Neon (Recommended)

```bash
# 1. Create free DB at neon.tech, copy connection string
# 2. Deploy
npm i -g vercel && vercel
# Add DATABASE_URL + JWT_SECRET in Vercel dashboard
# 3. Seed
DATABASE_URL="your-neon-url" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/salaries` | List with filters + pagination |
| POST | `/api/salaries` | Submit salary |
| GET | `/api/salaries/stats` | Aggregated stats by level |
| GET | `/api/companies` | Company list with median TC |
| GET | `/api/compare` | Side-by-side comparison (up to 4) |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |

## Feature Comparison Research

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | CompIQ |
|---------|-----------|-------|-------------|-----------|--------|
| Level-normalized data | YES | YES | NO | NO | YES |
| TC breakdown (base+bonus+stock) | YES | YES | Partial | Partial | YES |
| India-focused | NO | YES | YES | Partial | YES |
| Company comparison | YES | Partial | NO | NO | YES |
| P25/P50/P75 stats | YES | NO | NO | NO | YES |
| Filter by YOE | YES | YES | NO | NO | YES |
