-- Phase 2: languages and currency.
-- 1) Tour text per language in one jsonb column instead of *_en columns:
--    { "en": { "title": "...", "shortDescription": "...", "description": "...",
--              "includes": [...], "excludes": [...], "itinerary": [...] } }
--    The columns title / description / short_description / includes / excludes /
--    itinerary hold the DEFAULT language (Italian).
-- 2) Each tour is priced in its own currency (EUR or USD).
-- 3) Bookings remember the currency they were made in; locale becomes it | en.

ALTER TABLE tours ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR'
  CHECK (currency IN ('EUR', 'USD'));

-- Keep any existing English text.
UPDATE tours
SET translations = jsonb_strip_nulls(jsonb_build_object('en', jsonb_build_object(
  'title', NULLIF(title_en, ''),
  'shortDescription', NULLIF(short_description_en, ''),
  'description', NULLIF(description_en, ''),
  'includes', CASE WHEN COALESCE(array_length(includes_en, 1), 0) > 0 THEN to_jsonb(includes_en) END,
  'excludes', CASE WHEN COALESCE(array_length(excludes_en, 1), 0) > 0 THEN to_jsonb(excludes_en) END,
  'itinerary', itinerary_en
)))
WHERE translations = '{}'::jsonb
  AND (title_en IS NOT NULL OR short_description_en IS NOT NULL OR description_en IS NOT NULL OR itinerary_en IS NOT NULL);

ALTER TABLE tours
  DROP COLUMN IF EXISTS title_en,
  DROP COLUMN IF EXISTS short_description_en,
  DROP COLUMN IF EXISTS description_en,
  DROP COLUMN IF EXISTS includes_en,
  DROP COLUMN IF EXISTS excludes_en,
  DROP COLUMN IF EXISTS itinerary_en,
  DROP COLUMN IF EXISTS inclusions_en,
  DROP COLUMN IF EXISTS exclusions_en,
  DROP COLUMN IF EXISTS price_usd;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR'
  CHECK (currency IN ('EUR', 'USD'));

-- Booking language: Italian (default) or English.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_locale_check;
UPDATE bookings SET locale = 'it' WHERE locale NOT IN ('it', 'en');
ALTER TABLE bookings ALTER COLUMN locale SET DEFAULT 'it';
ALTER TABLE bookings ADD CONSTRAINT bookings_locale_check CHECK (locale IN ('it', 'en'));
