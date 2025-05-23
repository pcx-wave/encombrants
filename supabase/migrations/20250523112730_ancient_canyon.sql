/*
  # Fix test accounts and RLS policies

  1. Security
    - Enable RLS on users table
    - Add policies for users to read and update their own data
    - Update email confirmation status for test accounts
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