/*
  # Update users table and create deposit settings

  1. Schema Changes
    - Update users table constraint to include 'deposit' type
    - Create deposit_settings table for deposit-specific configurations
  
  2. Security
    - Enable RLS on deposit_settings table
    - Add policies for reading and managing deposit settings
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

-- Enable RLS on deposit_settings table
ALTER TABLE deposit_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read deposit settings" ON deposit_settings;
DROP POLICY IF EXISTS "Deposits can manage own settings" ON deposit_settings;

-- Create policies for deposit settings
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