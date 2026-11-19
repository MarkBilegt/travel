-- Phase 4: quote requests and group-departure sign-ups replace the contact form
-- and the online booking funnel.
--
-- inquiries.kind     quote  = quote request (optionally about one tour)
--                    signup = reserve a spot on a group departure (no payment)
-- inquiries.status   new -> quoted -> confirmed | lost
-- A confirmed sign-up counts towards departures.enrolled (the admin API
-- recalculates the total from confirmed sign-ups, so it never drifts).
-- Visitors never read this table: only the server (service role) inserts and reads.

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'quote' CHECK (kind IN ('quote', 'signup')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'confirmed', 'lost')),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  locale text NOT NULL DEFAULT 'it' CHECK (locale IN ('it', 'en')),
  tour_id uuid REFERENCES tours(id) ON DELETE SET NULL,
  departure_id uuid REFERENCES departures(id) ON DELETE SET NULL,
  travel_from date,
  travel_to date,
  flexible boolean NOT NULL DEFAULT false,
  adults int NOT NULL DEFAULT 1 CHECK (adults BETWEEN 1 AND 50),
  children int NOT NULL DEFAULT 0 CHECK (children BETWEEN 0 AND 50),
  budget_per_day numeric,
  interests text[] NOT NULL DEFAULT '{}',
  accommodation_style text,
  message text,
  admin_notes text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_departure ON inquiries (departure_id) WHERE departure_id IS NOT NULL;

DROP TRIGGER IF EXISTS inquiries_updated_at ON inquiries;
CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on inquiries"
  ON inquiries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Keep the messages already received through the old contact form.
INSERT INTO inquiries (kind, name, email, phone, message, is_read, created_at)
SELECT 'quote', name, email, phone,
       CASE WHEN tour_interest IS NULL OR tour_interest = '' THEN message
            ELSE tour_interest || E'\n\n' || message END,
       COALESCE(is_read, false), created_at
FROM contact_submissions;

DROP TABLE IF EXISTS contact_submissions;
