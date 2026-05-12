-- HCM Automation — initial schema (Supabase / PostgreSQL)
-- Run via Supabase SQL editor or: supabase db push

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizational units (manager_id → employees FK below)
CREATE TABLE organizational_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    unit_name VARCHAR(100) NOT NULL,
    parent_unit_id UUID REFERENCES organizational_units(id),
    manager_id UUID,
    cost_center VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_code VARCHAR(20) UNIQUE NOT NULL,
    position_title VARCHAR(100) NOT NULL,
    org_unit_id UUID REFERENCES organizational_units(id),
    salary_min NUMERIC(12,2),
    salary_max NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'vacant',
    requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    position_id UUID REFERENCES positions(id),
    application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    qualification_score INTEGER CHECK (qualification_score IS NULL OR (qualification_score >= 0 AND qualification_score <= 100)),
    status VARCHAR(50) NOT NULL DEFAULT 'applied',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personnel_number VARCHAR(20) UNIQUE NOT NULL,
    candidate_id UUID REFERENCES candidates(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    position_id UUID REFERENCES positions(id),
    org_unit_id UUID REFERENCES organizational_units(id),
    manager_id UUID REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizational_units
  ADD CONSTRAINT organizational_units_manager_id_fkey
  FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    iban VARCHAR(34) NOT NULL,
    bic VARCHAR(11) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE salary_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    base_salary NUMERIC(12,2) NOT NULL,
    bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_salary NUMERIC(12,2) NOT NULL,
    tax_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
    social_security NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_salary NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_position ON candidates(position_id);
CREATE INDEX idx_employees_org_unit ON employees(org_unit_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_employee ON payroll_runs(employee_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ou_updated_at BEFORE UPDATE ON organizational_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pos_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_cand_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_emp_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Demo-friendly: anon + authenticated can CRUD (tighten for production)
CREATE POLICY hcm_ou_all ON organizational_units FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_pos_all ON positions FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_cand_all ON candidates FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_emp_all ON employees FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_bank_all ON bank_details FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_sal_all ON salary_data FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_pay_all ON payroll_runs FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_audit_select ON audit_log FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY hcm_audit_ins ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
