# Launch checklist

Everything that must happen before the site replaces the old WordPress site (sainsanaa.net). Items marked **client** need a decision, an account or content from the cooperative; the rest is work for whoever deploys.

## 0. State of the project

- Code: complete for the agreed scope (quote requests, group departures, tours, info and culture pages, testimonials, English admin, Italian + English site). `npm run check` and `npm run build` pass.
- Database: the 18 migrations in `supabase/migrations` were run from scratch against a stand-in PostgreSQL (all apply cleanly, the public/anonymous role can read only active tours, upcoming departures and consented testimonials, and cannot read or write inquiries). They have **not** been run on a real Supabase project.
- Content: the tours, contact details, mission text, culture articles, visa and insurance notes now come from the cooperative's old site (sainsanaa.net) and are condensed or translated by us; photos are still stock placeholders, and the legal texts and English are drafts (see section 4).

## 1. Decisions and inputs (client)

- [ ] Final **brand name**, **domain** and **logo** (SVG, light and dark versions).
- [ ] Real **contact details**: phones, WhatsApp, e-mail, office address, opening hours, social links, map location.
- [ ] **Company details** for the footer and legal pages: legal name, registration number, tax ID, privacy contact.
- [ ] Which inbox receives request alerts (`OWNER_EMAIL`).
- [ ] **Photo and text rights**: confirm the cooperative owns, or has permission for, every photo and text carried over from the old site.
- [ ] The real **tours** (see section 4), prices in EUR, and the first group departures.
- [ ] **Terms**: deposit %, balance deadline, cancellation scale, offer validity, governing law (see `src/data/legal.ts`, every `[bracket]`).
- [ ] **Privacy**: retention periods (24 months for open requests, 10 years for confirmed trips are placeholders), hosting provider, EU representative question.
- [ ] A **lawyer or knowledgeable reviewer** for the Italian privacy policy and terms (EU consumer rules and the Italian package-travel law may apply).
- [ ] A **native Italian reader** for all Italian copy (`messages/it.json`, `src/data/*.ts`, e-mails).

## 2. Accounts and infrastructure

- [ ] **Supabase** project in an EU region (e.g. Frankfurt). Save the URL, anon key and service-role key.
- [ ] **Resend** account. Verify the sending domain (SPF, DKIM, and a DMARC record), then set `RESEND_FROM_EMAIL` to an address on that domain. Without this, e-mails land in spam or are rejected.
- [ ] **Hosting: Hostinger** (decided). Buy a plan that supports **Node.js web apps** (Business Web Hosting or a Cloud plan, not a basic PHP plan); pick an EU data-centre. Hostinger's own database is MySQL, so **the database stays on Supabase**; see section 2a.
- [ ] Set every variable from `.env.example` in Hostinger. Do **not** set `NEXT_PUBLIC_DEMO_MODE`.
- [ ] **Domain / DNS** control. Lower the TTL of the current records a day before the cut-over.
- [ ] Optional: Google Search Console access (also used for the dashboard panel).

## 2a. Deploying on Hostinger

Based on Hostinger's documentation ([Node.js apps](https://docs.hostinger.com/node.js/overview), [creating an app](https://docs.hostinger.com/node.js/creating-an-app)); their screens change, so follow what hPanel shows and confirm anything unclear with Hostinger support.

**What the project already provides for this**
- `package.json` `engines` and `.nvmrc`: Node 22 or newer. `npm run build` and `npm start` (`next start`, which listens on the `PORT` Hostinger sets) are the only commands needed.
- `GET /api/health` returns `{"ok":true}` for uptime monitors (it reveals nothing else).
- `npm run preflight` checks the server settings **before you deploy** and says READY or NOT READY. It tests every required variable, the password and secret lengths, that the address is a real https one, that demo mode is off, that Supabase answers, that every table and migration 020 are there, that visitors cannot read inquiries, and that the storage bucket exists. It never prints a secret. Run it against the production values: put them in a file such as `.env.production` (never commit it) and run `npm run preflight -- --env-file=.env.production`.
- The build works with no database: a page that cannot reach Supabase falls back to built-in content, so a build never fails because of the database.
- The Linux image-processing binary (sharp) is in the lockfile, so photo uploads work on Hostinger's servers.
- Security headers and HTTPS-only (HSTS) are on in production; the site does not advertise its framework.

**Steps**
1. **Before buying**, ask support: does the plan run Next.js 16 with Node 22 or later, with environment variables, in an EU location? (Hostinger lists Node 18, 20, 22 and 24.)
2. **Supabase first** (section 3): run migrations 001 to 020, then `npm run import:old-site`.
3. **Code on GitHub.** Push the project to a **private** GitHub repository owned by the cooperative. `.env.local` is git-ignored: never commit secrets. The photos folder `import/` is also ignored.
4. **hPanel > Websites > Add website > Node.js Apps** (or "Web App"). Import the repository and branch. Hostinger detects Next.js and fills the settings; check them:
   - Node version: **22** or newer.
   - Build: `npm install` then `npm run build` (the preset normally does this).
   - Start: Next.js server mode (`npm start`). If a start command is requested, use `npm run start`.
5. **Environment variables**, copied from `.env.example`. Enter all of them **before the first build**. Those that begin with `NEXT_PUBLIC_` (Supabase URL and anon key, `NEXT_PUBLIC_APP_URL`) are built into the site, so after changing one you must **redeploy**. `NEXT_PUBLIC_APP_URL` must be the final https domain. Do not set `NEXT_PUBLIC_DEMO_MODE`. Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`) only exist on the server.
6. **Deploy**, open the temporary address Hostinger gives, and check: `/api/health`, the home page, `/it/tours`, `/admin/login` (sign in, open each menu), send a test quote request, and upload one photo in the photo library.
7. **Updates.** Pushing to the connected branch triggers a rebuild. Run `npm run check` before pushing.
8. **Domain.** Add the domain in hPanel, then point DNS as Hostinger instructs (nameservers, or an A record), which is the cut-over step in section 6. HTTPS (SSL) must be active and HTTP must redirect to HTTPS.
9. **E-mail.** Do not rely on Hostinger mailboxes for the site: requests and acknowledgements are sent through Resend (section 2). A Hostinger mailbox can still be the team's own inbox.
10. **Monitoring.** Point an uptime monitor (for example UptimeRobot) at `https://<domain>/api/health`.

Hostinger-specific notes:

- **One process:** the in-memory spam limits (contact form, admin login) work properly on a single Node process, which is what this plan gives you. If Hostinger ever runs several instances, the limit becomes per instance.
- **Visitor IP:** the spam limits identify visitors by the proxy's `x-real-ip` or `x-forwarded-for` header (`getClientIp` in `src/lib/security.ts`). I could not confirm which header Hostinger sets. After the first deploy, test from two different networks: if both are treated as one visitor (or a visitor can dodge the limit by sending their own header), tell the developer. The contact form and admin login also have a global ceiling as a safety net.
- **Memory:** if builds fail with out-of-memory errors, ask Hostinger support to raise the build limits, or build elsewhere (GitHub Actions) and deploy the result.
- **Uploads:** photos go to Supabase Storage, not to Hostinger's disk, so they survive redeploys.
- **Backups:** Hostinger backs up files, **not** the Supabase database: use Supabase's own backups (section 3).
- **Logs:** use the Node.js app logs in hPanel to see server errors; there is no error-tracking tool set up.

## 3. Database

In the Supabase SQL editor, run the files in `supabase/migrations` **in order, 001 to 020**, once each. Then:

- [ ] **Load the old site's content** (84 articles, 470 photos, 2 more tours, 1 departure). Download the photos once, then import:
  `python scripts/old-site/download-images.py` (about 900 MB, kept out of git), then `npm run import:old-site -- --dry-run` to preview and `npm run import:old-site` to import. It resizes the photos, stores them in Supabase Storage and never overwrites anything already there. It reads the Supabase keys from `.env.local`.
  The text and links come from `scripts/old-site/data/site.json` (re-create it with `python scripts/old-site/crawl.py`).

- [ ] Check Storage: the image bucket(s) created by migrations 003 and 008 exist.
- [ ] Schedule the retention job (Database > Extensions > enable `pg_cron`):
  `select cron.schedule('purge-inquiries', '0 3 1 * *', 'select purge_old_inquiries()');`
  Use the retention values the cooperative decided on (they are the function's defaults; edit migration 017 or pass arguments).
- [ ] Old passport files from the previous booking flow are not part of this project. If the old Chinguun project's storage is ever reused, delete them.
- [ ] Turn on database backups (daily backups are included on paid plans; point-in-time recovery is optional).

## 4. Content

- [ ] `src/lib/constants.ts` `SITE_CONFIG`: name, legal name, domain, e-mails, phones, WhatsApp, address, map query, social links.
- [ ] `public/brand/logo.svg` and `logo-white.svg`; `public/images/placeholder.svg`.
- [ ] Footer line and legal pages: replace every `[bracket]` (`messages/*.json` `footer.legalLine`, `src/data/legal.ts`).
- [ ] Load the nine tours carried over from the old site: run `supabase/seed/tours.sql` in the SQL editor after the migrations (it never overwrites an existing tour; regenerate it with `npm run seed:tours` after editing `src/data/demo-tours.ts`). Then, in the admin panel, check each tour and replace the stock photos with real ones. The old site only quotes "about 70-150 EUR per person per day", so those tours show "from X" and the 18-day trip has its one real fixed quote (1,900 USD for 4+, 2,100 USD for 2-3): confirm current prices and the currency. Group size (2-12) and season (May-September) are our guesses.
- [ ] Optional: `supabase/seed/testimonials.sql` loads four public comments from the old site as HIDDEN reviews; show one only after that traveller agrees.
- [ ] Create upcoming group departures (Group departures > Add).
- [ ] Replace the stock photos on the home, about and services pages and in `src/data/articles.ts`. Check the cooperative's address (only "Ulaanbaatar" is shown), opening arrangements, social pages (none are linked) and the founding year (2014 is taken from the oldest posts).
- [ ] Review or replace the four culture articles (`src/data/articles.ts`) with the cooperative's own texts; review the Info page (`messages/*.json` `info`), especially the visa wording.
- [ ] Add real, consented reviews (Testimonials).
- [ ] Remove or keep the "Made by Monweb.mn" credit in the footer as agreed.
- [ ] `src/data/demo-tours.ts` is only used in demo mode; it can stay or be deleted.

## 5. Before pointing the domain

- [ ] `npm run check` and `npm run build` pass on the commit being deployed.
- [ ] Deploy to a **preview URL** first. Test on a phone (375 px) and a desktop:
  - Italian and English: home, tours, a tour page, group departures, info, culture, contact, privacy, terms.
  - Send a **quote request** and a **group sign-up**: both appear in Admin > Inquiries, the owner alert arrives (Reply-To = traveller), and the traveller acknowledgement arrives in the right language.
  - Mark a sign-up Confirmed: the departure's "joined" count changes.
  - Admin: wrong password is refused; rate limiting after repeated attempts; sign out works.
  - The map on the contact and tour pages loads only after the button is pressed.
- [ ] Check what spam protection gives you: the contact form has a honeypot and a per-IP limit. The limit is **in memory per server instance**, so on serverless hosting it is a soft limit. If spam appears, add a CAPTCHA (e.g. Cloudflare Turnstile) or a shared limiter (e.g. Upstash).
- [ ] Verify the security headers (the Content-Security-Policy is in `next.config.ts`; add any new third-party host there).
- [ ] Run `npm audit --omit=dev` and fix what it reports.

## 6. Cut-over and SEO

- [ ] Keep the old WordPress site running until the new one is verified.
- [ ] Point DNS at the new host; confirm HTTPS works and `www` redirects to the chosen host.
- [ ] Confirm the **old-URL redirects** (`src/lib/legacy-redirects.ts`) with a few real old URLs, e.g. `/about-us/`, `/il-visto/`, `/la-storia/`. Point old trip pages at their new tours once the real tours and slugs exist (edit that file).
- [ ] Set `NEXT_PUBLIC_APP_URL` to the final domain and redeploy (it feeds canonical URLs, hreflang, the sitemap and e-mail links).
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console; request indexing of the home and main pages; watch Coverage and Redirect errors for two weeks.
- [ ] Update external links the cooperative controls (Facebook, Google Business Profile, partner sites).

## 7. After launch

- [ ] Uptime monitoring on the home page and `/api/inquiries` is not needed (it is POST only); monitor the home page (UptimeRobot or similar).
- [ ] Error tracking is **not** set up; add Sentry (or the host's logs) if wanted.
- [ ] Hand over `ADMIN-GUIDE.md` and walk the cooperative through it once. Store the admin password and Supabase/Resend logins in the cooperative's password manager, not in chat.
- [ ] Put a recurring reminder to rotate `ADMIN_PASSWORD` and to review the retention job and the legal texts yearly.

## Known limits

- Only one shared admin password (no per-user accounts or audit log).
- No online payment and no automatic confirmation e-mail when an inquiry is marked Confirmed: the team replies by e-mail.
- The traveller-details / passport collection after confirmation was not built; the team asks for it by e-mail and should not store passport copies longer than needed.
- The website has no analytics. If the cooperative wants them, use a cookie-free tool or add a consent banner first.
