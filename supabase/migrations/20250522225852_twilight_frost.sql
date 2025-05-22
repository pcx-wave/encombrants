/*
  # Add deposit type and fix test accounts

  1. Changes
    - Add 'deposit' as a valid user type
    - Update test deposit account to use correct type
    - Set passwords for test accounts
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update the type check constraint to include 'deposit'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check;
ALTER TABLE public.users ADD CONSTRAINT users_type_check 
  CHECK (type = ANY (ARRAY['client'::text, 'collector'::text, 'deposit'::text]));

-- Update the test deposit account to use the correct type
UPDATE public.users 
SET type = 'deposit' 
WHERE email = 'test.deposit@example.com';

-- Set passwords for test accounts using Supabase's auth.users table
UPDATE auth.users 
SET encrypted_password = crypt('testclient123', gen_salt('bf'))
WHERE email = 'test.client@example.com';

UPDATE auth.users 
SET encrypted_password = crypt('testcollector123', gen_salt('bf'))
WHERE email = 'test.collector@example.com';

UPDATE auth.users 
SET encrypted_password = crypt('testdeposit123', gen_salt('bf'))
WHERE email = 'test.deposit@example.com';