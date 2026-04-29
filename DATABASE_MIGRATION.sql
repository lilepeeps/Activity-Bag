-- Database Migration: Add Allowance Payouts Table
-- Run this script in Supabase's SQL Editor to add support for tracking monetary rewards

-- Create the allowance_payouts table
CREATE TABLE allowance_payouts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  paid_at timestamp DEFAULT now(),
  note text,
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security for the new table
ALTER TABLE allowance_payouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Parents can view payouts for their children
CREATE POLICY "payouts_select_own"
  ON allowance_payouts FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Create RLS policy: Parents can insert payouts for their children
CREATE POLICY "payouts_insert_own"
  ON allowance_payouts FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN families f ON c.family_id = f.id
      WHERE f.parent_user_id = auth.uid()
    )
  );

-- Migration complete!
-- The allowance_payouts table is now ready for use.
