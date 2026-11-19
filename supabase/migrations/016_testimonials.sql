-- Phase 6: traveller reviews, managed in the admin panel.
-- Only real reviews, and only with the traveller's consent: a row is shown on
-- the site only when active AND consent_given.

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  quote text NOT NULL,
  language text NOT NULL DEFAULT 'it' CHECK (language IN ('it', 'en')),
  rating int CHECK (rating BETWEEN 1 AND 5),
  trip text,
  consent_given boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_public ON testimonials (sort_order, created_at DESC) WHERE active AND consent_given;

DROP TRIGGER IF EXISTS testimonials_updated_at ON testimonials;
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read consented active testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (active AND consent_given);

CREATE POLICY "Service role full access on testimonials"
  ON testimonials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
