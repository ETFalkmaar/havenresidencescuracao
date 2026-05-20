# Project notes for Claude

## Working agreements with the owner

- **Always push to GitHub immediately after making changes** zodat ze live gaan op Vercel en de eigenaar ze meteen kan verifiëren.
- **Per stap content-vragen stellen** — eigenaar levert teksten en foto's, Claude verzint geen placeholder-content.
- **Stap-voor-stap delivery**, low risk per stap; eerst database/structuur, dan UI; verifieer dat elke stap bouwt en deployed voor je verder gaat.
- **Security defaults: RLS op elke tabel, restrictieve policies, geen service-role key in client-code.** SSR-cookies via `@supabase/ssr`.

## Stack

- Next.js 15 (App Router) op Vercel
- Supabase (Postgres + Auth + Storage) — project-ref `pcdojiarpptcgeoddfeg`
- Tailwind 3.4
- TypeScript strict
- Path alias: `@/*` → `src/*`
- **Stripe** (vanaf stap 8): 100% upfront, iDEAL + creditcard, self-service boekingen
- **Airbnb iCal-sync** (bidirectioneel) voor beschikbaarheid

## Visuele stijl (uit referentie-mockup van 2026-05-20)

| Token | Waarde |
|---|---|
| Accent (sage) | `#6f7f4f` (Tailwind `sage-600`) |
| Achtergrond (cream) | `#f5f0e7` (Tailwind `cream-100`) |
| Footer (forest) | `#4a5a30` (Tailwind `forest`) |
| Heading-font | Cormorant Garamond via `next/font/google` |
| Body-font | Inter via `next/font/google` |
| Iconen | lucide-react, `stroke-width=1.5` |

## Environment variables (Vercel + .env.local)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public — Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public — publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — bypasses RLS |
| `NEXT_PUBLIC_SITE_URL` | Public — base URL voor canonical/metadata |
| `STRIPE_SECRET_KEY` | Server-only — Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Server-only — webhook handtekening |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public — Stripe.js init |
| `CRON_SECRET` | Server-only — Vercel cron auth header |
| `RESEND_API_KEY` | Server-only — booking-notificatie emails |

CLI tokens (gebruiker-env op dev-machine):

| Variable | Purpose |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Voor Supabase MCP + CLI |
| `VERCEL_TOKEN` | Voor Vercel CLI/API |

## Repo layout (doel)

```
src/
  app/                  Next.js routes (App Router)
    page.tsx            Home
    [slug]/page.tsx     Accommodatie-detail
    accommodaties/, beheer/, over-ons/, omgeving/, contact/
    admin/              Eigenaars-dashboard
    api/                cron + iCal + Stripe routes
    booking/success/    Post-payment redirect
  components/
    site/               Sectie-componenten (Hero, USPGrid, PropertyCard, etc.)
    ui/                 Primitives (Button, Pill, Card, Container, …)
  lib/
    supabase/           client + server + middleware
    stripe.ts           Stripe SDK helpers
    pricing.ts          Server-side prijscalc
    ical.ts             Parse + serialize
    email.ts            Notificatie-helpers
  middleware.ts         Refresh Supabase session
supabase/
  migrations/           SQL migration files
```

## Plan-referentie

`C:\Users\sonck\.claude\plans\dit-heb-ik-gemaakt-atomic-garden.md` — gedetailleerd stappenplan.
