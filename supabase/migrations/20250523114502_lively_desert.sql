/*
  # Fix Policy Conflicts

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Re-create policies with proper checks
    - Update test accounts without touching generated columns
    - Add insert policy for users table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for users table
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

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update test accounts email confirmation
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW(),
    last_sign_in_at = NOW()
WHERE email IN (
  'test.client@example.com',
  'test.collector@example.com',
  'test.deposit@example.com'
);