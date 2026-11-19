-- ─── Storage Bucket Setup ─────────────────────────────────
-- Creates the 'media' storage bucket for tour images, episode thumbnails, etc.
-- Run AFTER migration 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the media bucket (public = anyone can read URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read public files
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Allow service role (server-side uploads via admin) to insert
CREATE POLICY "Service role can upload"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'media');

-- Allow service role to delete
CREATE POLICY "Service role can delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'media');
