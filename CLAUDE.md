# Travel Agency Website - Project Context

## What This Is
Travel agency website template built by monweb.mn, being adapted for a new client
(a Mongolian inbound travel cooperative; public site in Italian and English). It started as a fork of an earlier client project; all of
that client's data, assets and git history have been removed.
Stack: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 + next-intl + Supabase + Resend

## Client Branding
- All client data (name, domain, phones, email, address, socials, bank holder) lives in
  `SITE_CONFIG` in `src/lib/constants.ts`. Never hardcode client details in components.
- Logos: `public/brand/logo.svg` and `public/brand/logo-white.svg` (placeholders for now).
- Fallback image: `public/images/placeholder.svg`.
- Anything still waiting on the client is marked `TODO(client)`.

## Design System: "Editorial Expedition"
Travel-magazine layouts, poster typography, photography-first.

Colors are Tailwind v4 tokens in `@theme` in `src/app/globals.css` (placeholder palette,
swap per client; `BRAND_COLORS` in constants mirrors them for emails/OG images):
- `brand-navy` #0E1A22 ink: dark surfaces, body text
- `brand-cream` #F5F0E8 sand: warm light sections; `brand-sand` / `brand-line` for fills and borders
- `brand-gold` #E2733A ember: primary CTA background (with navy text), accent text on DARK only
- `brand-gold-deep` #A84E1F: accent text on LIGHT backgrounds (WCAG AA)
- `brand-blue` #1E5B66 lake: secondary accent
Never use inline hex in components; use the tokens.

Typography (next/font, latin subset only: the site is Italian/English):
- `font-display` Oswald: h1/h2 automatically, uppercase; condensed so long Italian words fit on phones
- `font-accent` Cormorant Garamond italic: one accent word/phrase per heading (SectionHeading does this)
- `font-sans` Inter: body, leading-relaxed
- Labels/eyebrows: text-xs, uppercase, tracking-[0.2em], with a short rule before them

Patterns:
- Inner-page heroes: `<PageHero eyebrow title={[...lines]} accent image aside />` (About, Services, Contact, Tours)
- Section titles: `<SectionHeading eyebrow title description action />` (left aligned)
- Honest UI: no invented ratings, reviews, booking counters or payment logos; there is no online payment
- Buttons: `<Button>` or `buttonStyles()` on links (never a <button> inside <a>); pill shape, sentence case
- Cards: the whole card is one link; hover = slow image zoom + arrow rotate, no layout-shifting scale
- No emoji as icons (Windows shows flag emoji as letters): use lucide icons or text codes
- Motion: Framer Motion, ease [0.16, 1, 0.3, 1]; respect useReducedMotion; autoplay needs a pause control
- Demo content: `NEXT_PUBLIC_DEMO_MODE=true` shows `src/data/demo-tours.ts` while the DB is empty

## Project Structure
src/
├── app/
│   ├── [locale]/(public)/  ← Customer pages (it/en)
│   ├── (admin)/admin/      ← Admin panel (protected by src/proxy.ts)
│   └── api/                ← API routes
├── components/
│   ├── ui/              ← Reusable primitives
│   ├── layout/          ← Navbar, Footer, LanguagePicker
│   ├── home/            ← Homepage sections
│   ├── tours/           ← Tour components
│   ├── contact/         ← Quote request / group sign-up form
│   └── admin/           ← Admin components
├── emails/              ← React Email templates
├── lib/
│   ├── supabase/        ← DB clients (browser, server, public, admin)
│   ├── utils.ts         ← cn(), safeRedirectPath(), formatters
│   └── constants.ts     ← SITE_CONFIG and app constants
├── i18n/ + messages/    ← next-intl config (src/i18n/locales.ts is the language list) and it/en translations
└── types/index.ts       ← All TypeScript types
supabase/migrations/     ← Run in order on a fresh project (no seed data)

## Key Rules (ALWAYS follow)
1. Use cn() from lib/utils for className merging
2. All colors via Tailwind theme tokens - never inline hex
3. All user-facing text goes through next-intl (it + en); Italian is the default locale; add a language in src/i18n/locales.ts. The admin panel and the owner e-mail alerts are Mongolian-only (the public site is Italian/English). Exceptions with their own bilingual copy: app error/404 pages (src/lib/boundary-text.ts, no provider there), traveller e-mails (src/emails/inquiry-copy.ts), articles (src/data/articles.ts) and legal texts (src/data/legal.ts). tests/i18n.test.mts fails if the languages' keys diverge
4. Framer Motion for animations
5. Mobile-first responsive - test 375px first
6. Images via next/image always - never <img>
7. No hardcoded client data - use SITE_CONFIG, props or the database
8. shadcn/ui component patterns for all UI primitives
9. Do not commit or push unless explicitly asked
10. Run `npm run check` before finishing a change (typecheck + lint + tests)
11. DB row -> Tour mapping lives only in `src/lib/tour-mapper.ts`; security helpers (escaping, rate limits, search sanitising) only in `src/lib/security.ts`

## Scope decisions (client)
- No Mongolian language and no online payment: everything goes through quote requests and group sign-ups (`inquiries`). No bookings, accounts or passport collection.
- See PLAN.md for the phases, LAUNCH.md for go-live, ADMIN-GUIDE.md for the team.
