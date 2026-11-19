-- Add passport_urls column to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS passport_urls jsonb DEFAULT NULL;

COMMENT ON COLUMN bookings.passport_urls IS 'Array of Supabase Storage URLs for uploaded passport images';
