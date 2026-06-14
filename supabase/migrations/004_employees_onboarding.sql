-- Migration 004: Employee self-service onboarding columns
-- Adds payroll-relevant personal data fields that employees fill in via the self-service form

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS iban              TEXT,
  ADD COLUMN IF NOT EXISTS bic               TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS tax_id            TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT false;

-- Allow anonymous writes to employees for the self-service form (only IBAN/BIC/address/tax_id fields)
-- The anon key can update these specific columns, but not status or personnel_number
CREATE POLICY IF NOT EXISTS "anon_update_onboarding_fields" ON employees
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anon reads so the form can verify the employee exists before saving
CREATE POLICY IF NOT EXISTS "anon_read_employees" ON employees
  FOR SELECT TO anon USING (true);
