# Sain Sanaa travel website

Website for a Mongolian travel cooperative selling trips in Mongolia to foreign travellers (mainly Italian): tour catalogue, group departures, quote requests, practical information, culture articles, an English admin panel. Italian is the default language, English the second. There is no online payment and no visitor account.

Built by monweb.mn. Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · next-intl · Supabase · Resend.

## Documents

- `PLAN.md`: the phased plan and what each phase delivered.
- `LAUNCH.md`: everything to do before and after going live.
- `ADMIN-GUIDE.md`: how the cooperative's team uses the admin panel.
- `CLAUDE.md` / `AGENTS.md`: notes for AI coding agents.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (it redirects to `/it`). With `NEXT_PUBLIC_DEMO_MODE=true` the site shows sample tours from `src/data/demo-tours.ts` while the database is empty.

## Checks

```bash
npm run check      # typecheck + lint + tests (what CI runs)
npm run typecheck
npm run lint
npm test           # Node's built-in test runner, tests in tests/ (needs Node >= 22.18)
```

CI (`.github/workflows/ci.yml`) also builds the site and audits production dependencies. Keep dependencies patched with `npm audit fix` (never `--force` without reading what it changes).

## Database

SQL migrations are in `supabase/migrations`; run them in order (001 to 020) in the Supabase SQL editor. Main tables: `tours`, `departures`, `inquiries`, `testimonials`, `partners`, `articles` (blog, culture, travel info, trip archive), `content_photos` (gallery), `site_settings` (contact details) and `site_texts` (edited page texts). Visitors never read `inquiries`; only the server (service-role key) does. See `LAUNCH.md` for the retention job.

## How it fits together

- `src/app/[locale]/(public)`: public pages (home, tours, departures, info, culture, about, services, contact, privacy, terms).
- `src/app/(admin)/admin`: admin panel (Mongolian). Login is one shared password (`ADMIN_PASSWORD`); the session cookie is signed with `ADMIN_JWT_SECRET`.
- `src/app/api`: `inquiries` (public POST, admin list/update/delete), `tours`, `departures`, `testimonials`, `partners`, `content`, `upload`, `admin`.
- `src/i18n/locales.ts`: the single list of site languages. Messages are in `messages/it.json` and `messages/en.json` (a test keeps them in step).
- Tour text: Italian in the base columns, other languages in `tours.translations`.
- Quote requests and group sign-ups: `src/lib/inquiries.ts`, `src/components/contact/InquiryForm.tsx`, e-mails in `src/emails` (traveller: Italian/English; owner alerts: Mongolian).
- Old WordPress URLs redirect to the new pages: `src/lib/legacy-redirects.ts`.
- Legal texts (drafts with `[brackets]` to fill in): `src/data/legal.ts`.

## Environment variables

See `.env.example`. Required in production: the three Supabase values, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_EMAIL`, `NEXT_PUBLIC_APP_URL`, `ADMIN_PASSWORD` (12+ characters) and `ADMIN_JWT_SECRET` (32+ characters). Never set `NEXT_PUBLIC_DEMO_MODE` in production.

## What the team edits in the admin panel (all in Mongolian)

Tours, group departures, inquiries, articles and the blog, the photo library and gallery, testimonials, partners, the **website text** of every page (About, Services, Home sections, Contact FAQ, Travel info, footer, menu names, in Italian and English) and the **contact details** (phones, e-mails, address, social links, which inbox gets the alerts). Every save refreshes the public site at once (`src/lib/revalidate.ts`).

## Content from the old site

`scripts/old-site/` holds the crawler, the crawled data and the importer; see `LAUNCH.md` (section 3). `src/lib/legacy-redirects.generated.ts` is generated from the crawl (`npm run redirects:old-site`).
