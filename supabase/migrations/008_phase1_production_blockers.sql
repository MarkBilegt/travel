-- Phase 1 production blockers: booking ownership, private passport storage,
-- and missing booking/payment fields referenced by the application.

ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'awaiting_confirmation';

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS travelers jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS passport_files jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS include_vat boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_customer_email_idx ON bookings(customer_email);

COMMENT ON COLUMN bookings.user_id IS 'Supabase Auth user that owns this booking for new customer-created bookings';
COMMENT ON COLUMN bookings.passport_files IS 'Private passport storage metadata; do not store public passport URLs';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'passport-documents',
  'passport-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Service role can read passport documents"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'passport-documents');

CREATE POLICY "Service role can upload passport documents"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'passport-documents');

CREATE POLICY "Service role can update passport documents"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'passport-documents')
  WITH CHECK (bucket_id = 'passport-documents');

CREATE POLICY "Service role can delete passport documents"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'passport-documents');
