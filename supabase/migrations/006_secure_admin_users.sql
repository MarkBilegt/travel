-- Fix: Enable RLS on admin_users table
-- The admin_users table was missing RLS, allowing anyone with the anon key
-- to read admin emails and roles directly via the Supabase REST API.
-- All other tables already have RLS enabled.
-- The app uses the service role key (via getSupabaseAdmin) for all admin
-- operations, which bypasses RLS — so this change does not affect the app.

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Service role retains full access (used by all API routes)
CREATE POLICY "Service role full access on admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No policies for anon or authenticated roles → direct REST API access is blocked
