-- HCM install_all.sql — EINMAL in leerem Supabase-Projekt ausführen (gesamter Inhalt kopieren).
-- Bei Fehler "already exists": neues Projekt oder Tabellen per Dashboard löschen.

-- ========== 001_initial_schema ==========
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

-- ========== 002_functions_and_rpc ==========
-- RPC functions (Supabase SQL editor: run after 001; no psql \i)

CREATE OR REPLACE FUNCTION public.generate_personnel_number()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  new_number VARCHAR(20);
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CASE
      WHEN personnel_number ~ '^EMP[0-9]+$'
        THEN SUBSTRING(personnel_number FROM 4)::INTEGER
      ELSE NULL
    END
  ), 0) + 1
  INTO counter
  FROM employees;

  new_number := 'EMP' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_payroll(
  p_employee_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS TABLE (
  gross_salary NUMERIC(12,2),
  tax_deduction NUMERIC(12,2),
  social_security NUMERIC(12,2),
  net_salary NUMERIC(12,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_base NUMERIC(12,2);
  v_bonus NUMERIC(12,2);
  v_gross NUMERIC(12,2);
  v_tax NUMERIC(12,2);
  v_social NUMERIC(12,2);
  v_net NUMERIC(12,2);
  v_annual NUMERIC(14,2);
BEGIN
  SELECT s.base_salary, COALESCE(s.bonus, 0)
    INTO v_base, v_bonus
  FROM salary_data s
  WHERE s.employee_id = p_employee_id
    AND s.effective_from <= p_period_end
  ORDER BY s.effective_from DESC
  LIMIT 1;

  IF v_base IS NULL THEN
    RAISE EXCEPTION 'No salary_data for employee %', p_employee_id;
  END IF;

  v_gross := v_base + v_bonus;
  v_annual := v_gross * 12;

  IF v_annual < 60000 THEN
    v_tax := v_gross * 0.20;
  ELSIF v_annual < 100000 THEN
    v_tax := v_gross * 0.30;
  ELSE
    v_tax := v_gross * 0.40;
  END IF;

  v_social := v_gross * 0.193;
  v_net := v_gross - v_tax - v_social;

  RETURN QUERY SELECT v_gross, v_tax, v_social, v_net;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_personnel_number() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_payroll(UUID, DATE, DATE) TO anon, authenticated, service_role;

-- ========== seed test_data ==========
-- Seed data (run after migrations 001 + 002)

INSERT INTO organizational_units (unit_code, unit_name, cost_center) VALUES
('000', 'Global Bike HQ', 'CC-000'),
('100', 'Sales', 'CC-SAL-001'),
('200', 'Marketing', 'CC-MKT-001'),
('300', 'IT', 'CC-IT-001'),
('400', 'HR', 'CC-HR-001'),
('900', 'Security', 'CC-SEC-001');

INSERT INTO positions (position_code, position_title, org_unit_id, salary_min, salary_max, requirements) VALUES
('SEC-MGR-001', 'Security Manager', (SELECT id FROM organizational_units WHERE unit_code = '900'), 55000, 75000, '{"education": "Bachelor", "experience": 5, "skills": ["Security", "Leadership"]}'::jsonb),
('MKT-MGR-001', 'Marketing Manager', (SELECT id FROM organizational_units WHERE unit_code = '200'), 60000, 80000, '{"education": "Bachelor", "experience": 5, "skills": ["Marketing", "Digital"]}'::jsonb),
('IT-DEV-001', 'Software Developer', (SELECT id FROM organizational_units WHERE unit_code = '300'), 50000, 70000, '{"education": "Bachelor", "experience": 3, "skills": ["JavaScript", "React"]}'::jsonb),
('HR-SPE-001', 'HR Specialist', (SELECT id FROM organizational_units WHERE unit_code = '400'), 45000, 60000, '{"education": "Bachelor", "experience": 2, "skills": ["HR", "Communication"]}'::jsonb);

INSERT INTO candidates (first_name, last_name, email, phone, date_of_birth, position_id, qualification_score, application_data) VALUES
('Max', 'Mustermann', 'max.mustermann@example.com', '+49 170 1234567', '1990-05-15', (SELECT id FROM positions WHERE position_code = 'SEC-MGR-001'), 85, '{"cv": "10 Jahre Security Experience", "certifications": ["CISSP", "CEH"]}'::jsonb),
('Anna', 'Schmidt', 'anna.schmidt@example.com', '+49 171 2345678', '1988-08-20', (SELECT id FROM positions WHERE position_code = 'SEC-MGR-001'), 92, '{"cv": "Security Lead bei Dax-Konzern", "certifications": ["CISM", "CISSP"]}'::jsonb),
('John', 'Doe', 'john.doe@example.com', '+49 172 3456789', '1992-03-10', (SELECT id FROM positions WHERE position_code = 'MKT-MGR-001'), 78, '{"cv": "Marketing Manager Startup", "certifications": ["Google Ads"]}'::jsonb),
('Maria', 'Garcia', 'maria.garcia@example.com', '+49 173 4567890', '1991-11-25', (SELECT id FROM positions WHERE position_code = 'MKT-MGR-001'), 88, '{"cv": "Digital Marketing Experte", "certifications": ["Meta Blueprint"]}'::jsonb);

-- ========== seed demo_employee_for_payroll (optional) ==========
-- Optional: one active employee + salary so Workflow 02 can run immediately
INSERT INTO employees (
  personnel_number, candidate_id, first_name, last_name, email, phone,
  date_of_birth, position_id, org_unit_id, start_date, status
)
SELECT
  'EMP999001',
  c.id,
  c.first_name,
  c.last_name,
  'payroll.demo@example.com',
  c.phone,
  COALESCE(c.date_of_birth, DATE '1990-01-01'),
  c.position_id,
  p.org_unit_id,
  CURRENT_DATE,
  'active'
FROM candidates c
JOIN positions p ON p.id = c.position_id
WHERE c.email = 'max.mustermann@example.com'
ON CONFLICT (personnel_number) DO NOTHING;

INSERT INTO salary_data (employee_id, base_salary, bonus, effective_from)
SELECT e.id, 5200, 200, CURRENT_DATE
FROM employees e
WHERE e.personnel_number = 'EMP999001'
  AND NOT EXISTS (SELECT 1 FROM salary_data s WHERE s.employee_id = e.id);
