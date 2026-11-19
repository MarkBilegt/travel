-- Everything the cooperative edits from the admin panel without a developer:
--
--   site_settings  contact details, company details, social links (one row, key 'site')
--   site_texts     edited versions of the website texts (About, Services, Home, ...),
--                  per language and per text group; the built-in text in messages/*.json is
--                  the default, a row here replaces that group
--   articles       blog, culture, travel-info and past-trip articles
--   content_photos the photo library, now with captions, order and a "show in gallery" flag
--
-- Visitors (the public/anon key) may only read what is published; the server
-- (service role) does all writing.

-- ─── Site settings ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Edited website texts ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_texts (
  locale text NOT NULL CHECK (locale IN ('it', 'en')),
  namespace text NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, namespace)
);

-- ─── Articles (blog, culture, travel info, past trips) ──────────────────────

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  -- news = blog post, trips = past trip programme, culture = history/traditions, info = practical travel info
  category text NOT NULL CHECK (category IN ('news', 'trips', 'culture', 'info')),
  title text NOT NULL,
  summary text,
  -- Plain text with light formatting: blank line = new paragraph, "## " heading,
  -- "- " list item, **bold**, *italic*, [link](url), ![alt](image url), @[video](youtube url)
  body text NOT NULL DEFAULT '',
  -- Other languages: { "en": { "title": "...", "summary": "...", "body": "..." } }
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  cover_image text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  -- Lower first; used for info and culture articles (blog is ordered by date)
  sort_order int NOT NULL DEFAULT 0,
  -- Address of the page on the old WordPress site, kept for redirects and reference
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_category_date ON articles (category, published_at DESC) WHERE published;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Photo library ───────────────────────────────────────────────────────────

ALTER TABLE content_photos
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS in_gallery boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS storage_path text;

CREATE INDEX IF NOT EXISTS idx_content_photos_gallery ON content_photos (category, sort_order, uploaded_at DESC) WHERE in_gallery;

-- ─── Row level security ──────────────────────────────────────────────────────

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read site texts" ON site_texts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read published articles" ON articles FOR SELECT TO anon, authenticated USING (published AND published_at <= now());

CREATE POLICY "Service role full access on site_settings" ON site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on site_texts" ON site_texts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on articles" ON articles FOR ALL TO service_role USING (true) WITH CHECK (true);
