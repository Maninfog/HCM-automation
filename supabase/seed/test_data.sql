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
