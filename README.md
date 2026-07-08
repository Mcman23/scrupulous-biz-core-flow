# Scrupulous Biz Core Flow

A standalone CRM app (React + Vite) — companies, clients, pipeline/leads, deals, services, expenses, payments and follow-ups.

This project is fully independent: it no longer depends on Base44's backend. Data and authentication are powered by [Supabase](https://supabase.com) (Postgres + Auth), and it deploys automatically to [Vercel](https://vercel.com) on every push to `main`.

## Stack

- React 18 + Vite 6
- Tailwind CSS + shadcn/ui components
- Supabase (Postgres database + Auth) via `@supabase/supabase-js`
- React Query for data fetching/caching
- Deployed on Vercel, connected to this GitHub repo for CI/CD

## One-time setup

1. **Database schema** — open your Supabase project → SQL Editor → paste the contents of `supabase_migration.sql` from this repo → Run. This creates all tables (companies, clients, services, leads, deals, expenses, payments, follow_ups, activities, profiles), row-level security policies, and an auto-profile trigger for new signups.
2. **Environment variables** — copy `.env.example` to `.env.local` for local dev, and set the same two variables in your Vercel project settings (Production/Preview/Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Both values are on your Supabase project's **Settings → API** page.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Auth

- Email/password sign up sends a confirmation link (Supabase default) — no extra config needed.
- "Continue with Google" requires enabling the Google provider in Supabase → Authentication → Providers.
- Password reset uses Supabase's recovery-link flow.

## Deployment

This repo is linked to a Vercel project — pushing to `main` triggers an automatic production deployment.
