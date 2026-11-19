-- Phase 5 decision: no online payment and no bookings. Everything goes through
-- quote requests and group sign-ups (inquiries, migration 014).
--
-- Passport files uploaded by the old booking flow lived in the storage bucket
-- created in 003/005; delete the objects from the Supabase dashboard (Storage),
-- not here, so nothing is removed silently.

DROP TABLE IF EXISTS bookings CASCADE;
