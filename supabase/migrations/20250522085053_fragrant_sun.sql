/*
  # Initial Schema Setup for Bulky Waste Collection Platform

  1. New Tables
    - `users`
      - Base table for all users (clients and collectors)
      - Extends Supabase auth.users
    - `collectors`
      - Additional information for collector users
      - Vehicle details and supported waste types
    - `requests`
      - Pickup requests created by clients
      - Includes waste details, location, and availability
    - `proposals`
      - Collection proposals made by collectors
      - Links collectors to requests with pricing
    - `routes`
      - Optimized collection routes
      - Groups multiple requests for efficient collection
    - `route_stops`
      - Individual stops within a route
      - Links routes to requests with order and timing
    - `disposal_sites`
      - Waste disposal facility information
      - Includes location and accepted waste types

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure data isolation between clients and collectors
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  type text NOT NULL CHECK (type IN ('client', 'collector')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Collectors table (additional collector information)
CREATE TABLE IF NOT EXISTS collectors (
  id uuid PRIMARY KEY REFERENCES users(id),
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('van', 'trailer', 'truck')),
  vehicle_capacity_volume numeric NOT NULL,
  vehicle_capacity_weight numeric NOT NULL,
  vehicle_license_plate text,
  supported_waste_types text[] NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs integer DEFAULT 0
);

ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read collector profiles"
  ON collectors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Collectors can update own profile"
  ON collectors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'matched', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  waste_types text[] NOT NULL,
  volume numeric NOT NULL,
  weight numeric,
  photos text[],
  location_address text NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Collectors can read all requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM collectors WHERE id = auth.uid()
  ));

CREATE POLICY "Clients can create requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND type = 'client'
    )
  );

-- Availability windows for requests
CREATE TABLE IF NOT EXISTS availability_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  CHECK (start_time < end_time)
);

ALTER TABLE availability_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read availability windows"
  ON availability_windows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can manage availability windows"
  ON availability_windows
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  collector_id uuid NOT NULL REFERENCES collectors(id),
  price numeric NOT NULL CHECK (price > 0),
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  CHECK (scheduled_start < scheduled_end)
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can read own proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = collector_id);

CREATE POLICY "Clients can read proposals for their requests"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Collectors can create proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = collector_id AND
    EXISTS (
      SELECT 1 FROM collectors WHERE id = auth.uid()
    )
  );

-- Disposal sites table
CREATE TABLE IF NOT EXISTS disposal_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  accepted_waste_types text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disposal_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disposal sites"
  ON disposal_sites
  FOR SELECT
  TO authenticated
  USING (true);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id uuid NOT NULL REFERENCES collectors(id),
  disposal_site_id uuid NOT NULL REFERENCES disposal_sites(id),
  distance numeric NOT NULL,
  duration integer NOT NULL, -- in minutes
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  CHECK (start_time < end_time)
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can read own routes"
  ON routes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = collector_id);

CREATE POLICY "Collectors can manage own routes"
  ON routes
  FOR ALL
  TO authenticated
  USING (auth.uid() = collector_id);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES requests(id),
  stop_order integer NOT NULL,
  estimated_arrival timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped')),
  UNIQUE (route_id, stop_order)
);

ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collectors can read route stops"
  ON route_stops
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_id AND collector_id = auth.uid()
    )
  );

CREATE POLICY "Collectors can manage route stops"
  ON route_stops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_id AND collector_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_proposals_request_id ON proposals(request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_collector_id ON proposals(collector_id);
CREATE INDEX IF NOT EXISTS idx_routes_collector_id ON routes(collector_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_request_id ON route_stops(request_id);