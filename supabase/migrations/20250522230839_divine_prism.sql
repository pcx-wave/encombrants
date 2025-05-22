/*
  # Fix auth setup and policies

  1. Security
    - Enable RLS on users table
    - Add policies for users to read and update their own data
    - Update email confirmation status for test accounts

  2. Changes
    - Enable row level security
    - Add read policy for authenticated users
    - Add update policy for authenticated users
    - Update email confirmation status
*/

-- Enable RLS
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

-- Update email confirmation status for test accounts
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    last_sign_in_at = NOW(),
    updated_at = NOW()
WHERE email IN (
  'test.client@example.com',
  'test.collector@example.com',
  'test.deposit@example.com'
);