# Sain Sanaa site: re-plan (draft)

Status: draft for discussion. Nothing in this plan is implemented yet.
Written after reviewing the old site (https://sainsanaa.net) on 2026-11-14.

## 1. What we are actually building

**Sain Sanaa Cooperativa Mongolia**: an inbound tour cooperative that sells trips **in Mongolia to foreign travellers, mainly Italians**.

- Mostly tailor-made trips (quote on request) plus fixed **group departures** with a minimum group size.
- Day-by-day itineraries, "price includes / excludes", UAZ 4x4 + driver, ger camps, nomad-family and monastery stays.
- Indicative price 60-150 USD or 70-150 EUR per person per day; group departure example: 1,740 EUR pp, min 4, confirmed at 2 sign-ups, single supplement 280 EUR.
- The selling point is the **cooperative / fair-trade mission** (profits shared among members, money stays in Mongolia, support for monasteries and Mongolian students of Italian).
- Today: WordPress.com, no online booking or payment, quotes by e-mail / WhatsApp.

The current codebase was built for the opposite business (Mongolians buying trips abroad, paid in MNT). About half of it carries over; the rest changes or goes.

## 2. Decisions needed from the friend (blocking)

| # | Question | My default if unanswered |
| --- | --- | --- |
| 1 | Languages: Italian + English? Mongolian at all? | Italian (default) + English; no Mongolian public site |
| 2 | Booking model: quote request only, or deposits online? How do customers pay today? | Launch with quote requests + group-departure sign-up, **no online payment**; payment instructions sent by e-mail |
| 3 | Name and domain: stays "Sain Sanaa Cooperativa Mongolia" on sainsanaa.net? | Yes |
| 4 | Content/photos: can we reuse their itineraries and photos? Who owns them? | Ask for originals; use neutral demo content until then |
| 5 | Contact details: sainsanaaviaggi@gmail.com and +976 9586 8948 (WhatsApp) as the starting values? A domain e-mail? | Use them; recommend a domain e-mail (trust + deliverability) |
| 6 | Legal set-up (who is the contracting company, tax IDs, insurance/guarantee for travellers) | Needs the friend; see Risks |
| 7 | Is there any production database yet? | Assume **no** (so we can reset the schema cleanly) |

Items 1 and 2 change the plan the most.

## 3. Phases

Sizes: **S** = under a day, **M** = a few days, **L** = about a week. Sizes assume the answers above.

### Phase 1: Strip the outbound business — DONE (draft copy awaits the friend; migration 011 drops gift_travel_episodes and sponsors)
- Remove **Gift & Travel** completely: public page, nav/footer/home banner, admin page, API routes, tables/columns, translations (23 source files).
- Remove MNT-specific pieces: 10% VAT option, personal/company Mongolian bank split, loyalty rewards in MNT, "Mongolian bank" FAQ text.
- Replace outbound demo tours (Japan, Turkey, Paris...) with generic Mongolia demo tours (no copied text).
- Replace country filter/flags with regions inside Mongolia.
- Fix SEO text that says "tours to Asia and Europe from Mongolia".
- Rewrite About / Why-us / Services / FAQ copy around the cooperative mission (draft copy, friend approves).

### Phase 2: Languages and currency — DONE (Italian default + English; tour text in `tours.translations` jsonb, per-tour EUR/USD currency; migration 012; still to do: Italian copy review by a native speaker, slug translations)
- Add the `it` locale and make it the default; keep `en`. Remove hardcoded `mn | en` pairs (about 30 files); drive everything from the routing config.
- **Move tour translations to one `translations jsonb` per tour** keyed by locale, instead of `title_en`, `description_en`... columns (does not scale to a third language).
- Money: each tour has its own currency (EUR or USD) and a price mode (see Phase 3). Format by currency and locale. Remove MNT everywhere.
- hreflang for it/en, sitemap per locale, translated slugs optional.
- Update the admin tour form to edit Italian and English side by side.

### Phase 3: Tour model for inbound travel — DONE (migration 013; departures admin + public calendar; price modes, tiers, single supplement; still open: public season/activity landing pages, departure sign-up = Phase 4)
New tour fields: `tour_type` (private / group / both), `regions[]`, `season_months[]`, `activities[]`, `difficulty`, `accommodation[]` (hotel, ger camp, tent, nomad family, monastery), `vehicle`, `price_mode` (fixed / from-per-day / on request), `price_currency`, `price_tiers` (price by group size), `single_supplement`.
- Itinerary days gain an "overnight type" and region.
- New **`departures`** table: start/end, price override, min/max participants, status (open / confirmed / full / cancelled), enrolled count.
- Public pages: filters by region, season, duration, activity, difficulty, private vs group; "Group departures" calendar page; tour page shows price tiers and the single supplement.

### Phase 4: From booking to quote-and-enrol funnel — MOSTLY DONE (migration 014: `inquiries`; quote form, departure sign-up, it/en acknowledgement + owner e-mail, admin pipeline; still open: secure traveller-details/passport link after confirmation, removal of the old bookings API/account pages/admin bookings page, which stay until Phase 5 decides payments)
- **Quote request form** (travel dates or flexibility, number of travellers, budget per day, interests, accommodation style, language, message) stored in a new `inquiries` table (replaces `contact_submissions`).
- **Group departure sign-up**: reserve a spot with no payment and no forced account; shows "confirmed at N sign-ups".
- E-mails: owner notification (Reply-To = traveller) and an acknowledgement to the traveller in their language (the bilingual e-mail system already exists; extend it to Italian).
- Admin: inquiry pipeline (new -> quoted -> confirmed / lost), notes, link to departure.
- **Passports are no longer collected at checkout.** After a trip is confirmed, send a secure link for traveller details; store passport files privately with an automatic delete-after date.
- Retire the 6-step booking modal and the account requirement for visitors.

### Phase 5: Online payment — DECIDED: none (done)
Decision from the client: no Mongolian language and no online payment (no QPay, Bonum or card provider available to the business). Everything runs through quote requests and group sign-ups; payment is a bank transfer arranged by e-mail after a written offer. Removed: bookings API and tables (migration 015), account and visitor sign-in, bank details, booking e-mails, the Mongolian admin and owner e-mails (admin and owner alerts are now English). Still open: a secure link for traveller/passport details after a trip is confirmed (not built; nothing collects passports now).

### Phase 6: Content and trust — BUILT, CONTENT IS DRAFT (info hub /info with visa, insurance, travel, climate, health, money, safety; 4 culture articles in src/data/articles.ts; testimonials table + admin page, hidden until real consented reviews exist (migration 016); 308 redirects from the old WordPress URLs in src/lib/legacy-redirects.ts; impact section on the home page. Not done: photo galleries by region (needs real photos), mapping old trip pages to the new tours (needs real tours), reusing the old site's own history and culture texts)
- Home: lead with the cooperative story and "where your money goes".
- Practical-information hub: visa, insurance, trains and flights, climate and gear, vaccinations, safety.
- Culture and history articles (simple `articles` table or MDX).
- Testimonials with consent (admin-managed, real only), photo galleries by region, insurance page.
- SEO: Italian keyword structure, JSON-LD (TouristTrip / Offer in EUR), **301 redirects from the old WordPress URLs** so existing Google ranking is kept.

### Phase 7: Legal and privacy — BUILT AS DRAFT (privacy policy and terms in src/data/legal.ts, it/en, every [bracket] is for the cooperative/lawyer; Google Maps loads only on click so no cookie banner is needed; legal line + links in footer; erase button + retention function (migration 017). Needs: company details, retention periods, deposit/cancellation rules, EU representative question, lawyer review)
GDPR-aware privacy policy and cookie notice, terms with deposit and cancellation rules, passport-data policy plus a retention job, company legal details in the footer, Italian text reviewed by the friend or a lawyer.

### Phase 8: Launch — PREPARED (see LAUNCH.md and ADMIN-GUIDE.md; .env.example added; migrations 001-018 verified end to end on a stand-in PostgreSQL, which also found that `tours.is_hero` had no migration: added as 018). The remaining steps need the cooperative's accounts and decisions: real Supabase/Resend/hosting/DNS, content, legal review)

## 4. Data model sketch

```
tours        slug, tour_type, regions[], season_months[], activities[], difficulty,
             duration_days, group_min, group_max, price_mode, price_currency,
             price_from, price_unit, price_tiers jsonb, single_supplement,
             accommodation[], vehicle, images[], cover_image, status,
             translations jsonb { it: {title, summary, description, includes[],
             excludes[], itinerary[], notes}, en: {...} }
departures   tour_id, starts_on, ends_on, price, currency, min_participants,
             max_participants, status
inquiries    kind (quote | departure_signup | contact), tour_id?, departure_id?,
             name, email, whatsapp, country, locale, travellers, date_from/to,
             budget_per_day?, interests[], accommodation_pref, message,
             status, notes, consent_at
bookings     inquiry_id, departure_id?, status, total, currency, travellers jsonb,
             traveller_details_token, passport_delete_after
payments     booking_id, kind (deposit | balance), amount, currency, method, status
articles     slug, locale, title, body, published
testimonials name, country, text, tour_id?, consent, published
```

Because there is no production database yet, the plan is to **replace migrations 001-010 with one clean baseline** instead of stacking changes on legacy columns (`country_flag`, `edu_tv_url`, `title_en`...).

## 5. What stays

Next.js/Supabase base, auth, admin shell and tour CRUD (extended), the day-by-day itinerary structure, the security layer (escaping, rate limits, CSP, admin session), bilingual e-mail framework, the "Editorial Expedition" design system (re-coloured to their brand), tests and CI.

## 6. MVP cut

**Launch = Phases 1, 2, 3, 4, 6, 7, 8.** Payment (Phase 5) stays manual (bank-wire instructions by e-mail) until the friend chooses a provider.

## 7. Risks and unknowns

- **Payments:** provider availability for a Mongolian business is unverified (see Phase 5).
- **Content rights:** old itineraries and photos must be confirmed as theirs before reuse; some old pages are stale (e.g. a link still says "Estate 2018").
- **Legal:** selling packaged trips to EU consumers may bring obligations (data protection, package-travel rules, traveller protection). I am not a lawyer; the friend should confirm.
- **SEO migration:** moving off WordPress without redirects would lose existing rankings.
- **Translation quality:** Italian must come from the friend or a native reviewer, not machine output.
- **Photography:** the design relies on strong Mongolian landscape photos; stock images are a stopgap only.

## 8. Suggested order

1. Send the friend questions 1-7.
2. Start Phase 1 now (no answers needed).
3. When answers 1 and 2 arrive: Phases 2 -> 3 -> 4.
4. Phases 6 and 7 in parallel with 4 as content arrives.
5. Phase 8, then Phase 5 when a payment provider is chosen.
