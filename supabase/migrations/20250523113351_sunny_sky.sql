/*
  # Complete Database Setup

  1. Schema
    - Drop all existing tables
    - Create users, collectors, requests, proposals, routes tables
    - Set up all foreign key relationships
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    
  3. Test Data
    - Create test accounts in auth.users
    - Create corresponding profiles in public tables
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.route_stops CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.availability_windows CASCADE;
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.disposal_sites CASCADE;
DROP TABLE IF EXISTS public.collectors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Collectors can update own profile" ON public.collectors;
DROP POLICY IF EXISTS "Public can read collector profiles" ON public.collectors;
DROP POLICY IF EXISTS "Clients can create requests" ON public.requests;
DROP POLICY IF EXISTS "Clients can read own requests" ON public.requests;
DROP POLICY IF EXISTS "Collectors can read all requests" ON public.requests;
DROP POLICY IF EXISTS "Users can read availability windows" ON public.availability_windows;
DROP POLICY IF EXISTS "Clients can manage availability windows" ON public.availability_windows;
DROP POLICY IF EXISTS "Collectors can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Collectors can read own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Clients can read proposals for their requests" ON public.proposals;
DROP POLICY IF EXISTS "Anyone can read disposal sites" ON public.disposal_sites;
DROP POLICY IF EXISTS "Collectors can manage own routes" ON public.routes;
DROP POLICY IF EXISTS "Collectors can manage route stops" ON public.route_stops;

-- Users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  address text,
  type text NOT NULL CHECK (type IN ('client', 'collector', 'deposit')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Collectors table
CREATE TABLE public.collectors (
  id uuid PRIMARY KEY REFERENCES public.users(id),
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('van', 'trailer', 'truck')),
  vehicle_capacity_volume numeric NOT NULL CHECK (vehicle_capacity_volume > 0),
  vehicle_capacity_weight numeric NOT NULL CHECK (vehicle_capacity_weight > 0),
  vehicle_license_plate text,
  supported_waste_types text[] NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs integer DEFAULT 0
);

ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can update own profile"
  ON public.collectors
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read collector profiles"
  ON public.collectors
  FOR SELECT
  TO authenticated
  USING (true);

-- Requests table
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  waste_types text[] NOT NULL,
  volume numeric NOT NULL CHECK (volume > 0),
  weight numeric CHECK (weight > 0),
  photos text[],
  location_address text NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create requests"
  ON public.requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND type = 'client'
    )
  );

CREATE POLICY "Clients can read own requests"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Collectors can read all requests"
  ON public.requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collectors 
      WHERE id = auth.uid()
    )
  );

-- Availability Windows table
CREATE TABLE public.availability_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  CHECK (start_time < end_time)
);

ALTER TABLE public.availability_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read availability windows"
  ON public.availability_windows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can manage availability windows"
  ON public.availability_windows
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests 
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

-- Proposals table
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  collector_id uuid NOT NULL REFERENCES public.collectors(id),
  price numeric NOT NULL CHECK (price > 0),
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  CHECK (scheduled_start < scheduled_end)
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can create proposals"
  ON public.proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = collector_id);

CREATE POLICY "Collectors can read own proposals"
  ON public.proposals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = collector_id);

CREATE POLICY "Clients can read proposals for their requests"
  ON public.proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

-- Disposal Sites table
CREATE TABLE public.disposal_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  accepted_waste_types text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.disposal_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disposal sites"
  ON public.disposal_sites
  FOR SELECT
  TO authenticated
  USING (true);

-- Routes table
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id uuid NOT NULL REFERENCES public.collectors(id),
  disposal_site_id uuid NOT NULL REFERENCES public.disposal_sites(id),
  distance numeric NOT NULL,
  duration integer NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  CHECK (start_time < end_time)
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can manage own routes"
  ON public.routes
  FOR ALL
  TO authenticated
  USING (auth.uid() = collector_id);

-- Route Stops table
CREATE TABLE public.route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.requests(id),
  stop_order integer NOT NULL,
  estimated_arrival timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  UNIQUE (route_id, stop_order)
);

ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can manage route stops"
  ON public.route_stops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_id AND collector_id = auth.uid()
    )
  );

-- Create test accounts
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, updated_at, last_sign_in_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test.client@example.com', crypt('testclient123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'test.collector@example.com', crypt('testcollector123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com', crypt('testdeposit123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO UPDATE
SET 
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = EXCLUDED.updated_at,
  last_sign_in_at = EXCLUDED.last_sign_in_at;

-- Create test user profiles
INSERT INTO public.users (id, email, name, type)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test.client@example.com', 'Test Client', 'client'),
  ('00000000-0000-0000-0000-000000000002', 'test.collector@example.com', 'Test Collector', 'collector'),
  ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com', 'Test Deposit', 'deposit')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- Create test collector profile
INSERT INTO public.collectors (
  id,
  vehicle_type,
  vehicle_capacity_volume,
  vehicle_capacity_weight,
  vehicle_license_plate,
  supported_waste_types,
  rating,
  completed_jobs
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'van',
  12,
  1500,
  'TEST123',
  ARRAY['furniture', 'appliances', 'electronics', 'household']::text[],
  4.8,
  42
)
ON CONFLICT (id) DO UPDATE
SET
  vehicle_type = EXCLUDED.vehicle_type,
  vehicle_capacity_volume = EXCLUDED.vehicle_capacity_volume,
  vehicle_capacity_weight = EXCLUDED.vehicle_capacity_weight,
  vehicle_license_plate = EXCLUDED.vehicle_license_plate,
  supported_waste_types = EXCLUDED.supported_waste_types,
  rating = EXCLUDED.rating,
  completed_jobs = EXCLUDED.completed_jobs;