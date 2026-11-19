-- Remember which language the customer used when booking, so every later
-- e-mail (payment under review, confirmed, cancelled, resent) matches it.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'mn';

ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_locale_check;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_locale_check CHECK (locale IN ('mn', 'en'));

COMMENT ON COLUMN bookings.locale IS 'Site language used at booking time (mn | en); used for customer e-mails';
