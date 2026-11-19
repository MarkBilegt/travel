-- Add child pricing, group discounts, and departure schedule to tours

ALTER TABLE tours
  ADD COLUMN price_child    numeric,
  ADD COLUMN child_age_min  int,
  ADD COLUMN child_age_max  int,
  ADD COLUMN discounts          jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN departure_schedule jsonb NOT NULL DEFAULT '{}';

COMMENT ON COLUMN tours.price_child        IS 'Child ticket price in MNT';
COMMENT ON COLUMN tours.child_age_min      IS 'Minimum age for child pricing (inclusive)';
COMMENT ON COLUMN tours.child_age_max      IS 'Maximum age for child pricing (inclusive)';
COMMENT ON COLUMN tours.discounts          IS 'Array of {min_people, percentage} group discount rules';
COMMENT ON COLUMN tours.departure_schedule IS 'Departure schedule: {type, dates?, weekday?, months?, note}';
