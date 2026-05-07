# Project notes for Claude

## Working agreements with the owner

- **Always push to GitHub immediately after making changes** so they go live
  on Vercel and the owner can verify them. Even database-only fixes (RLS,
  RPCs, migrations) should be reflected in `supabase/migrations/` and pushed
  in the same turn — pushing also invalidates the Vercel ISR cache so fixes
  show up right away.
- **Skip Stripe and any other paid third-party integrations** until the
  owner explicitly says otherwise. Build a "manual confirm" booking flow
  instead.
- **Step-wise delivery, low risk per step.** Database first, then UI on top
  of it; verify each step builds and deploys before piling on the next.
- **Security defaults: RLS on every table, restrictive policies, no service
  role key in client code.** The site uses `@supabase/ssr` for SSR-safe
  cookies; admin-only writes go via authenticated server actions.

## Stack

- Next.js 15 (App Router) on Vercel
- Supabase (Postgres + Auth + Storage)
- Tailwind 3.4
- TypeScript strict
- Path alias: `@/*` → `src/*`

## Repo layout

```
src/
  app/                  Next.js routes (App Router)
    page.tsx            Public homepage
    [slug]/page.tsx     Public residence detail
    admin/              Authenticated admin area (login + dashboard)
    actions/            Server actions
  components/           Shared UI components
  lib/
    supabase/           Browser + server client + middleware helper
    types.ts            Hand-written domain types (chose over generated for build stability)
    format.ts           Currency / date formatters
  middleware.ts         Refreshes Supabase session on every request
supabase/
  migrations/           SQL migration files (also live in remote DB)
.mcp.json               Project-scoped Supabase MCP (project-ref pcdojiarpptcgeoddfeg)
vercel.json             Pins framework=nextjs to prevent UI-only config drift
```

## Environment variables

Set in Vercel + `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public — Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public — publishable key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — bypasses RLS for admin tasks |
| `NEXT_PUBLIC_SITE_URL` | Public — base URL for canonical / metadata |

CLI tokens used by Claude (set as user env vars on the dev machine):

| Variable | Purpose |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Personal access token — used by Supabase MCP and CLI |
| `VERCEL_TOKEN` | Vercel personal token — used by Vercel CLI and direct API calls |

## Things to remember about this database

- `is_admin()` is called inside RLS policies. It MUST have
  `GRANT EXECUTE … TO anon, authenticated` (see migration 006). If anon
  cannot execute it, every public read returns 401.
- `admin_users` is bootstrapped via `bootstrap_first_admin()` RPC — the
  first authenticated user to call it claims the owner role. After that
  the RPC refuses additional self-promotions.
- Bookings table has Stripe columns prepared but unused until the Stripe
  step. Keep `status='pending'` flow working without payment.
