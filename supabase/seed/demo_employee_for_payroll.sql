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
