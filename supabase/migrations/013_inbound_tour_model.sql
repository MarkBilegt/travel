-- Phase 3: tour model for inbound travel + group departures.
--
-- tours
--   tour_type          private | group | both
--   regions            text[]   Mongolian regions the tour visits (keys from MONGOLIA_REGIONS);
--                               replaces the single `country` column
--   season_months      int[]    months (1-12) the tour can run
--   activities         text[]   horse_riding, hiking, ...
--   accommodation      text[]   hotel, ger_camp, tent, nomad_family, monastery, guesthouse
--   vehicle            text     jeep_4x4 | minivan | mixed
--   price_mode         fixed | from_per_day | on_request
--   price_tiers        jsonb    [{ "minPeople": 2, "maxPeople": 3, "price": 2100 }, ...] per person
--   single_supplement  numeric  extra for a single room, in the tour's currency
-- itinerary days (jsonb) may now carry "overnight" and "region".
--
-- departures: dated group trips people can join.
--
-- Also removes two leftovers of the old outbound business (bookings.include_vat, tours.country_flag).

ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS tour_type text NOT NULL DEFAULT 'both'
    CHECK (tour_type IN ('private', 'group', 'both')),
  ADD COLUMN IF NOT EXISTS regions text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS season_months int[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accommodation text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS vehicle text,
  ADD COLUMN IF NOT EXISTS price_mode text NOT NULL DEFAULT 'fixed'
    CHECK (price_mode IN ('fixed', 'from_per_day', 'on_request')),
  ADD COLUMN IF NOT EXISTS price_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS single_supplement numeric;

-- Keep the region people already chose.
UPDATE tours
SET regions = ARRAY[country]
WHERE regions = '{}' AND country IS NOT NULL AND country <> '';

ALTER TABLE tours
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS country_flag;

CREATE INDEX IF NOT EXISTS tours_regions_idx ON tours USING gin (regions);
CREATE INDEX IF NOT EXISTS tours_activities_idx ON tours USING gin (activities);

ALTER TABLE bookings DROP COLUMN IF EXISTS include_vat;

-- ─── Departures ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  -- NULL = use the tour's price
  price numeric,
  min_participants int NOT NULL DEFAULT 2 CHECK (min_participants >= 1),
  max_participants int NOT NULL DEFAULT 12 CHECK (max_participants >= 1),
  enrolled int NOT NULL DEFAULT 0 CHECK (enrolled >= 0),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'confirmed', 'full', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (max_participants >= min_participants)
);

CREATE INDEX IF NOT EXISTS departures_tour_idx ON departures(tour_id);
CREATE INDEX IF NOT EXISTS departures_start_idx ON departures(start_date);

DROP TRIGGER IF EXISTS departures_updated_at ON departures;
CREATE TRIGGER departures_updated_at
  BEFORE UPDATE ON departures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE departures ENABLE ROW LEVEL SECURITY;
-- Visitors see departures of active tours, except cancelled ones.
-- Writes go through the service role (admin API), which bypasses RLS.
DROP POLICY IF EXISTS "departures_public_read" ON departures;
CREATE POLICY "departures_public_read" ON departures FOR SELECT USING (
  status <> 'cancelled'
  AND EXISTS (SELECT 1 FROM tours t WHERE t.id = departures.tour_id AND t.status = 'active')
);
