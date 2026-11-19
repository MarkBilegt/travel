-- ─── Migration 007 — Tour English translation columns ────────────────────────
-- Adds parallel English-language columns for tour content. The Mongolian
-- columns remain the source of truth; English columns are nullable and the
-- application falls back to Mongolian when EN is missing.
--
-- Columns added:
--   short_description_en   text      — one-line summary shown in cards / SEO
--   description_en         text      — long marketing paragraph
--   includes_en            text[]    — "what's included" bullet list
--   excludes_en            text[]    — "what's not included" bullet list
--   itinerary_en           jsonb     — day-by-day program, same shape as itinerary
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS short_description_en text,
  ADD COLUMN IF NOT EXISTS description_en       text,
  ADD COLUMN IF NOT EXISTS includes_en          text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excludes_en          text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS itinerary_en         jsonb  NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tours.short_description_en IS 'English mirror of short_description; null means fall back to Mongolian';
COMMENT ON COLUMN tours.description_en       IS 'English mirror of description; null means fall back to Mongolian';
COMMENT ON COLUMN tours.includes_en          IS 'English mirror of includes[]; empty array means fall back to Mongolian';
COMMENT ON COLUMN tours.excludes_en          IS 'English mirror of excludes[]; empty array means fall back to Mongolian';
COMMENT ON COLUMN tours.itinerary_en         IS 'English mirror of itinerary; empty array means fall back to Mongolian';
