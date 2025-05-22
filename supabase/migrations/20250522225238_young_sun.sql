/*
  # Create test accounts

  Creates test accounts for different roles in the system:
  - Test Client
  - Test Collector
  - Test Deposit Manager (as a client type)
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
  ARRAY['furniture', 'appliances', 'electronics', 'household']::text[],
  4.8,
  42
)
ON CONFLICT (id) DO NOTHING;

-- Create test deposit (as a client type since deposit is not a valid user type)
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, type)
VALUES ('00000000-0000-0000-0000-000000000003', 'test.deposit@example.com', 'Test Deposit', 'client')
ON CONFLICT (id) DO NOTHING;