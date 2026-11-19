-- ─── Enums ─────────────────────────────────────────────────────────────────

CREATE TYPE tour_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE tour_difficulty AS ENUM ('easy', 'moderate', 'challenging');
CREATE TYPE tour_category AS ENUM ('adventure', 'cultural', 'nature', 'luxury', 'family');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method_enum AS ENUM ('qpay', 'bank_transfer', 'cash');
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'partial', 'paid');
CREATE TYPE partner_type_enum AS ENUM ('accommodation', 'transport', 'activity', 'other');
CREATE TYPE sponsor_tier_enum AS ENUM ('platinum', 'gold', 'silver', 'bronze');
CREATE TYPE video_platform AS ENUM ('youtube', 'direct', 'edutv', 'moviebox');
CREATE TYPE content_status AS ENUM ('draft', 'published');
CREATE TYPE admin_role_enum AS ENUM ('super_admin', 'admin', 'staff');

-- ─── Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_en text,
  description text NOT NULL,
  short_description text NOT NULL,
  duration int NOT NULL,
  group_size_min int NOT NULL DEFAULT 1,
  group_size_max int NOT NULL DEFAULT 20,
  price numeric NOT NULL,
  price_usd numeric,
  difficulty tour_difficulty NOT NULL DEFAULT 'moderate',
  category tour_category NOT NULL,
  destinations text[] NOT NULL DEFAULT '{}',
  country text,
  country_flag text,
  is_new boolean DEFAULT false,
  includes text[] NOT NULL DEFAULT '{}',
  excludes text[] NOT NULL DEFAULT '{}',
  itinerary jsonb NOT NULL DEFAULT '[]',
  images text[] NOT NULL DEFAULT '{}',
  cover_image text NOT NULL,
  featured boolean DEFAULT false,
  status tour_status NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  tour_id uuid REFERENCES tours(id),
  tour_title text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  departure_date date NOT NULL,
  return_date date,
  adults int NOT NULL DEFAULT 1,
  children int NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL,
  payment_method payment_method_enum,
  payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
  booking_status booking_status_enum NOT NULL DEFAULT 'pending',
  special_requests text,
  passengers_json jsonb DEFAULT '[]',
  qpay_invoice_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE content_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform video_platform NOT NULL DEFAULT 'youtube',
  url text NOT NULL,
  thumbnail_url text,
  description text,
  category text,
  tags text[] DEFAULT '{}',
  views int DEFAULT 0,
  published_at timestamptz,
  status content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE content_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_text text,
  category text,
  tags text[] DEFAULT '{}',
  size_bytes int,
  width int,
  height int,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE gift_travel_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  episode_number int NOT NULL,
  title text NOT NULL,
  description text,
  recipient_name text,
  recipient_destination text,
  video_url text,
  thumbnail_url text NOT NULL,
  youtube_url text,
  edu_tv_url text,
  movie_box_url text,
  tags text[] DEFAULT '{}',
  views int DEFAULT 0,
  featured boolean DEFAULT false,
  published_at timestamptz,
  status content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website text,
  description text,
  type partner_type_enum NOT NULL DEFAULT 'other',
  display_order int DEFAULT 0,
  is_visible boolean DEFAULT true
);

CREATE TABLE sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website text,
  description text,
  tier sponsor_tier_enum NOT NULL DEFAULT 'bronze',
  is_gift_travel boolean DEFAULT false,
  display_order int DEFAULT 0,
  is_visible boolean DEFAULT true
);

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role admin_role_enum NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX tours_status_idx ON tours(status);
CREATE INDEX tours_featured_idx ON tours(featured) WHERE featured = true;
CREATE INDEX bookings_status_idx ON bookings(booking_status);
CREATE INDEX bookings_created_idx ON bookings(created_at DESC);
CREATE INDEX episodes_status_idx ON gift_travel_episodes(status);

-- ─── RLS Policies ───────────────────────────────────────────────────────────

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tours_public_read" ON tours FOR SELECT USING (status = 'active');

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- No public policies - admin client (service role) bypasses RLS

ALTER TABLE content_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos_public_read" ON content_videos FOR SELECT USING (status = 'published');

ALTER TABLE content_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_read" ON content_photos FOR SELECT TO anon USING (true);

ALTER TABLE gift_travel_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episodes_public_read" ON gift_travel_episodes FOR SELECT USING (status = 'published');

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_public_read" ON partners FOR SELECT USING (is_visible = true);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors_public_read" ON sponsors FOR SELECT USING (is_visible = true);

-- ─── updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
