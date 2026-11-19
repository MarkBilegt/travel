-- Phase 7: data retention for inquiries (see the privacy policy, "How long we keep it").
--
-- Requests that never became a trip are deleted after `open_months` (default 24)
-- without any update. Confirmed ones are kept for `confirmed_years` (default 10,
-- accounting duties) after their last update. Adjust the defaults to whatever
-- the cooperative and its lawyer decide, and keep the privacy policy in step.
--
-- Run it on a schedule, for example monthly with pg_cron (Supabase dashboard,
-- Database > Extensions > pg_cron), then:
--   select cron.schedule('purge-inquiries', '0 3 1 * *', 'select purge_old_inquiries()');
--
-- One person can be erased at any time from the admin panel (Inquiries >
-- Delete), which covers "right to erasure" requests.

CREATE OR REPLACE FUNCTION purge_old_inquiries(open_months int DEFAULT 24, confirmed_years int DEFAULT 10)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed int;
BEGIN
  WITH gone AS (
    DELETE FROM inquiries
    WHERE (status <> 'confirmed' AND updated_at < now() - make_interval(months => open_months))
       OR (status = 'confirmed' AND updated_at < now() - make_interval(years => confirmed_years))
    RETURNING 1
  )
  SELECT count(*) INTO removed FROM gone;
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION purge_old_inquiries(int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION purge_old_inquiries(int, int) TO service_role;
