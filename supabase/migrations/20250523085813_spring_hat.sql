/*
  # Add deposit registration functionality

  1. New Tables
    - `deposit_settings` table to store deposit-specific settings
      - `id` (uuid, primary key)
      - `deposit_id` (uuid, references users)
      - `payment_enabled` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `deposit_settings` table
    - Add policy for deposit owners to manage their settings
*/

-- Create deposit settings table
CREATE TABLE IF NOT EXISTS public.deposit_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id uuid NOT NULL REFERENCES public.users(id),
  payment_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (deposit_id)
);

-- Enable RLS
ALTER TABLE public.deposit_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Deposits can manage own settings"
  ON public.deposit_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = deposit_id)
  WITH CHECK (auth.uid() = deposit_id);

CREATE POLICY "Anyone can read deposit settings"
  ON public.deposit_settings
  FOR SELECT
  TO authenticated
  USING (true);