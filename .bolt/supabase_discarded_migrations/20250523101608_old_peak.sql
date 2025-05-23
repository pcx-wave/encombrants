/*
  # Update test accounts email confirmation

  1. Changes
    - Update email confirmation status for test accounts
*/

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