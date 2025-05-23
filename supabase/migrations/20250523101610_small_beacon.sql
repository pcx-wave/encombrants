/*
  # Create initial schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - name (text)
      - phone (text, optional)
      - address (text, optional)
      - type (text, enum: client, collector, deposit)
      - created_at (timestamptz)

    - collectors
      - id (uuid, primary key)
      - vehicle_type (text, enum: van, trailer, truck)
      - vehicle_capacity_volume (numeric)
      - vehicle_capacity_weight (numeric)
      - vehicle_license_plate (text, optional)
      - supported_waste_types (text[])
      - rating (numeric)
      - completed_jobs (integer)

    - requests
      - id (uuid, primary key)
      - client_id (uuid)
      - status (text, enum)
      - waste_types (text[])
      - volume (numeric)
      - weight (numeric, optional)
      - photos (text[], optional)
      - location_address (text)
      - location_lat (numeric)
      - location_lng (numeric)
      - description (text, optional)
      - created_at (timestamptz)

    - availability_windows
      - id (uuid, primary key)
      - request_id (uuid)
      - start_time (timestamptz)
      - end_time (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  address text,
  type text NOT NULL CHECK (type IN ('client', 'collector', 'deposit')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Collectors table
CREATE TABLE IF NOT EXISTS public.collectors (
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
CREATE TABLE IF NOT EXISTS public.requests (
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
CREATE TABLE IF NOT EXISTS public.availability_windows (
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

-- Create test accounts
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test.client@example.com', crypt('testclient123', gen_salt('bf')), now()),
  ('00000000-0000-0000-0000-000000000002', 'test.collector@example.com', crypt('testcollector123', gen_salt('bf')), now()),
  ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com', crypt('testdeposit123', gen_salt('bf')), now())
ON CONFLICT (id) DO UPDATE
SET 
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  encrypted_password = EXCLUDED.encrypted_password;

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
  supported_waste_types = EXCLUDED.supported_waste_types;