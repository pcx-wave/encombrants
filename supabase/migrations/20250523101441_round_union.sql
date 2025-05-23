/*
  # Fix email confirmations and RLS policies

  1. Changes
    - Update email_confirmed_at for test accounts
    - Enable RLS on users table
    - Add RLS policies for users table

  2. Security
    - Enable RLS on users table
    - Add policy for users to read own data
    - Add policy for users to update own data
*/

-- Enable email confirmations for all test accounts
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    last_sign_in_at = NOW(),
    updated_at = NOW()
WHERE email IN (
  'test.client@example.com',
  'test.collector@example.com',
  'test.deposit@example.com'
);

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