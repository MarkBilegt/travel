-- The home page hero carousel (tours.is_hero) is read by the public queries and
-- toggled in the admin panel, but no earlier migration created the column.
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_hero boolean NOT NULL DEFAULT false;
