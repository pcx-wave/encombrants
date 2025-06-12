/*
  # Add deposit user type and deposit settings table

  1. Changes
    - Update users table type constraint to include 'deposit'
    - Create deposit_settings table for deposit-specific configuration
    - Add RLS policies for deposit settings

  2. Security
    - Enable RLS on deposit_settings table
    - Add policies for deposit users to manage their own settings
    - Allow anyone to read deposit settings (for public visibility)
*/

-- Update users table to include deposit type
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_type_check;
ALTER TABLE users ADD CONSTRAINT users_type_check 
  CHECK (type IN ('client', 'collector', 'deposit'));

-- Create deposit settings table
CREATE TABLE IF NOT EXISTS deposit_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id uuid NOT NULL UNIQUE,
  payment_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deposit_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deposit settings"
  ON deposit_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Deposits can manage own settings"
  ON deposit_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = deposit_id)
  WITH CHECK (auth.uid() = deposit_id);