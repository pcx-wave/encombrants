/*
  # Create test accounts

  1. Test Users
    - Creates test accounts for client, collector, and deposit roles
    - Sets up collector profile for test collector
  
  2. Security
    - Uses the same RLS policies as regular users
*/

-- Create test client
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'test.client@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'test.client@example.com', 'Test Client', 'client')
ON CONFLICT (id) DO NOTHING;

-- Create test collector
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000002', 'test.collector@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, type)
VALUES ('00000000-0000-0000-0000-000000000002', 'test.collector@example.com', 'Test Collector', 'collector')
ON CONFLICT (id) DO NOTHING;

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
  ARRAY['furniture', 'appliances', 'electronics', 'household'],
  4.8,
  42
)
ON CONFLICT (id) DO NOTHING;

-- Create test deposit
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, type)
VALUES ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com', 'Test Deposit', 'deposit')
ON CONFLICT (id) DO NOTHING;