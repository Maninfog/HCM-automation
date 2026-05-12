# 🚀 HCM Automation - n8n Edition mit GitHub Simulationen

## 🎯 PROJEKT-ÜBERSICHT

Wir bauen ein **komplettes HCM-System** mit:
- **n8n** für die Workflow-Automation
- **Supabase** als Datenbank
- **GitHub Pages** für simulierte SAP UI
- **GitHub Actions** für Backend-Services
- **Vercel/Netlify** für Frontends

**Vorteile:**
- ⚡ Schneller als UiPath (2 Stunden statt 2 Tage)
- 💰 Komplett kostenlos
- 🌐 Cloud-native, läuft überall
- 🔄 Einfach zu deployen und zu sharen

---

## 📦 SYSTEM-ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (GitHub Pages)                   │
│  • Bewerbungsportal                                          │
│  • HR Dashboard                                              │
│  • Employee Portal                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOWS                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Process I   │  │  Process II  │  │   Reports    │      │
│  │  Onboarding  │  │   Payroll    │  │   & Alerts   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Database)                       │
│  • PostgreSQL                                                │
│  • REST API                                                  │
│  • Realtime Subscriptions                                   │
│  • Row Level Security                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SIMULATED SERVICES (GitHub)                     │
│  • Mock SAP API (GitHub Actions Webhook)                    │
│  • PDF Generator Service                                     │
│  • Email Mock Service                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ REPOSITORY-STRUKTUR

Erstelle folgende Repo-Struktur auf GitHub:

```
hcm-automation/
├── README.md
├── .github/
│   └── workflows/
│       ├── mock-sap-api.yml
│       ├── pdf-generator.yml
│       └── email-service.yml
├── n8n-workflows/
│   ├── 01_Process_I_Onboarding.json
│   ├── 02_Process_II_Payroll.json
│   ├── 03_HR_Approval_Workflow.json
│   └── 04_Reporting_Dashboard.json
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed/
│   │   └── test_data.sql
│   └── functions/
│       ├── calculate_payroll.sql
│       └── generate_personnel_number.sql
├── frontend/
│   ├── bewerbungsportal/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── hr-dashboard/
│   │   ├── index.html
│   │   ├── dashboard.js
│   │   └── components/
│   └── employee-portal/
│       ├── index.html
│       └── payslip.js
├── mock-services/
│   ├── sap-mock.js
│   ├── pdf-generator.js
│   └── email-mock.js
└── docs/
    ├── API.md
    ├── SETUP.md
    └── WORKFLOWS.md
```

---

## 🎬 STEP 1: Supabase Setup

### 1.1 SQL Schema (supabase/migrations/001_initial_schema.sql)

```sql
-- ====================================
-- HCM DATABASE SCHEMA
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizational Units
CREATE TABLE organizational_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    unit_name VARCHAR(100) NOT NULL,
    parent_unit_id UUID REFERENCES organizational_units(id),
    manager_id UUID,
    cost_center VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_code VARCHAR(20) UNIQUE NOT NULL,
    position_title VARCHAR(100) NOT NULL,
    org_unit_id UUID REFERENCES organizational_units(id),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'vacant',
    requirements JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    position_id UUID REFERENCES positions(id),
    application_data JSONB DEFAULT '{}',
    qualification_score INTEGER CHECK (qualification_score BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'applied',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bank Details
CREATE TABLE bank_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    iban VARCHAR(34) NOT NULL,
    bic VARCHAR(11) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Salary Data
CREATE TABLE salary_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,
    bonus DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payroll Runs
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_salary DECIMAL(10,2) NOT NULL,
    tax_deduction DECIMAL(10,2) DEFAULT 0,
    social_security DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_position ON candidates(position_id);
CREATE INDEX idx_employees_org_unit ON employees(org_unit_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_employee ON payroll_runs(employee_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizational_units_updated_at BEFORE UPDATE ON organizational_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Enable later if needed)
ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow all for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON organizational_units FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON positions FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON candidates FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON employees FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON bank_details FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON salary_data FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow all for authenticated users" ON payroll_runs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

### 1.2 Supabase Functions (supabase/functions/)

**generate_personnel_number.sql:**
```sql
CREATE OR REPLACE FUNCTION generate_personnel_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_number VARCHAR(20);
    counter INTEGER;
BEGIN
    -- Get current max number
    SELECT COALESCE(MAX(CAST(SUBSTRING(personnel_number FROM 4) AS INTEGER)), 0) + 1
    INTO counter
    FROM employees;
    
    -- Format: EMP000001
    new_number := 'EMP' || LPAD(counter::TEXT, 6, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

**calculate_payroll.sql:**
```sql
CREATE OR REPLACE FUNCTION calculate_payroll(
    p_employee_id UUID,
    p_period_start DATE,
    p_period_end DATE
)
RETURNS TABLE (
    gross_salary DECIMAL(10,2),
    tax_deduction DECIMAL(10,2),
    social_security DECIMAL(10,2),
    net_salary DECIMAL(10,2)
) AS $$
DECLARE
    v_base_salary DECIMAL(10,2);
    v_bonus DECIMAL(10,2);
    v_gross DECIMAL(10,2);
    v_tax DECIMAL(10,2);
    v_social DECIMAL(10,2);
    v_net DECIMAL(10,2);
BEGIN
    -- Get salary data
    SELECT s.base_salary, COALESCE(s.bonus, 0)
    INTO v_base_salary, v_bonus
    FROM salary_data s
    WHERE s.employee_id = p_employee_id
    AND s.effective_from <= p_period_start
    ORDER BY s.effective_from DESC
    LIMIT 1;
    
    -- Calculate gross
    v_gross := v_base_salary + v_bonus;
    
    -- German tax brackets (simplified)
    -- < 60k/year: 20%, 60-100k: 30%, >100k: 40%
    CASE
        WHEN (v_gross * 12) < 60000 THEN v_tax := v_gross * 0.20;
        WHEN (v_gross * 12) < 100000 THEN v_tax := v_gross * 0.30;
        ELSE v_tax := v_gross * 0.40;
    END CASE;
    
    -- Social security ~19.3%
    v_social := v_gross * 0.193;
    
    -- Net salary
    v_net := v_gross - v_tax - v_social;
    
    RETURN QUERY SELECT v_gross, v_tax, v_social, v_net;
END;
$$ LANGUAGE plpgsql;
```

### 1.3 Test Data (supabase/seed/test_data.sql)

```sql
-- Organizational Units
INSERT INTO organizational_units (unit_code, unit_name, cost_center) VALUES
('000', 'Global Bike HQ', 'CC-000'),
('100', 'Sales', 'CC-SAL-001'),
('200', 'Marketing', 'CC-MKT-001'),
('300', 'IT', 'CC-IT-001'),
('400', 'HR', 'CC-HR-001'),
('900', 'Security', 'CC-SEC-001');

-- Positions
INSERT INTO positions (position_code, position_title, org_unit_id, salary_min, salary_max, requirements) VALUES
('SEC-MGR-001', 'Security Manager', (SELECT id FROM organizational_units WHERE unit_code = '900'), 55000, 75000, '{"education": "Bachelor", "experience": 5, "skills": ["Security", "Leadership"]}'),
('MKT-MGR-001', 'Marketing Manager', (SELECT id FROM organizational_units WHERE unit_code = '200'), 60000, 80000, '{"education": "Bachelor", "experience": 5, "skills": ["Marketing", "Digital"]}'),
('IT-DEV-001', 'Software Developer', (SELECT id FROM organizational_units WHERE unit_code = '300'), 50000, 70000, '{"education": "Bachelor", "experience": 3, "skills": ["JavaScript", "React"]}'),
('HR-SPE-001', 'HR Specialist', (SELECT id FROM organizational_units WHERE unit_code = '400'), 45000, 60000, '{"education": "Bachelor", "experience": 2, "skills": ["HR", "Communication"]}');

-- Sample Candidates
INSERT INTO candidates (first_name, last_name, email, phone, date_of_birth, position_id, qualification_score, application_data) VALUES
('Max', 'Mustermann', 'max.mustermann@example.com', '+49 170 1234567', '1990-05-15', (SELECT id FROM positions WHERE position_code = 'SEC-MGR-001'), 85, '{"cv": "10 Jahre Security Experience", "certifications": ["CISSP", "CEH"]}'),
('Anna', 'Schmidt', 'anna.schmidt@example.com', '+49 171 2345678', '1988-08-20', (SELECT id FROM positions WHERE position_code = 'SEC-MGR-001'), 92, '{"cv": "Security Lead bei Dax-Konzern", "certifications": ["CISM", "CISSP"]}'),
('John', 'Doe', 'john.doe@example.com', '+49 172 3456789', '1992-03-10', (SELECT id FROM positions WHERE position_code = 'MKT-MGR-001'), 78, '{"cv": "Marketing Manager Startup", "certifications": ["Google Ads"]}'),
('Maria', 'Garcia', 'maria.garcia@example.com', '+49 173 4567890', '1991-11-25', (SELECT id FROM positions WHERE position_code = 'MKT-MGR-001'), 88, '{"cv": "Digital Marketing Experte", "certifications": ["Meta Blueprint"]}}');
```

---

## 🌊 STEP 2: n8n Workflows

### 2.1 Workflow 1: Process I - Onboarding (n8n-workflows/01_Process_I_Onboarding.json)

**Trigger:** Webhook (POST /webhook/candidate-apply)

**Nodes:**

```
1. Webhook Trigger
   ↓
2. Validate Input Data
   ↓
3. Supabase: Check if Candidate Exists (by email)
   ↓
4. IF: Candidate Exists?
   ├─ YES → Update Candidate
   └─ NO → Create New Candidate
   ↓
5. AI: Score Candidate (using OpenAI/Claude)
   ↓
6. Supabase: Update Qualification Score
   ↓
7. IF: Score > 80?
   ├─ YES → Auto-Shortlist
   └─ NO → Set Status "Review"
   ↓
8. Slack/Email: Notify HR Team
   ↓
9. Wait for Approval (n8n Form or Manual Trigger)
   ↓
10. IF: Approved?
    ├─ YES → Continue to Hiring
    └─ NO → Send Rejection Email
    ↓
11. Supabase: Generate Personnel Number (Function)
    ↓
12. Supabase: Create Employee Record
    ↓
13. Supabase: Update Position Status → "filled"
    ↓
14. HTTP: Trigger Mock SAP API (GitHub Action)
    ↓
15. Generate Welcome Email
    ↓
16. Generate Onboarding PDF
    ↓
17. Send Welcome Package (Email + PDF)
    ↓
18. Slack: Notify Team "New Employee"
    ↓
19. Log to Audit
```

**Detaillierte Node-Konfigurationen:**

**Node 1: Webhook**
```json
{
  "httpMethod": "POST",
  "path": "candidate-apply",
  "responseMode": "responseNode",
  "options": {}
}
```

**Node 2: Validate Input**
```javascript
// Code Node
const requiredFields = ['firstName', 'lastName', 'email', 'positionId'];
const data = $input.all()[0].json;

for (const field of requiredFields) {
  if (!data[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.email)) {
  throw new Error('Invalid email format');
}

return { json: data };
```

**Node 3: Supabase - Check Candidate**
```json
{
  "method": "GET",
  "url": "={{ $env.SUPABASE_URL }}/rest/v1/candidates",
  "qs": {
    "email": "eq.={{ $json.email }}"
  },
  "headers": {
    "apikey": "={{ $env.SUPABASE_KEY }}",
    "Authorization": "Bearer {{ $env.SUPABASE_KEY }}"
  }
}
```

**Node 5: AI Scoring (Claude API)**
```javascript
// HTTP Request to Claude
const candidateData = $input.first().json;

const prompt = `Analyze this candidate application and score from 0-100 based on qualifications:

Name: ${candidateData.firstName} ${candidateData.lastName}
Position Applied: ${candidateData.positionTitle}
Experience: ${candidateData.experience || 'Not provided'}
Education: ${candidateData.education || 'Not provided'}
Skills: ${candidateData.skills || 'Not provided'}
Cover Letter: ${candidateData.coverLetter || 'Not provided'}

Respond ONLY with a JSON object:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "strengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>", "<concern2>"]
}`;

return {
  json: {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: prompt
    }]
  }
};
```

**Node 8: Slack Notification**
```json
{
  "channel": "#hr-notifications",
  "text": "🎯 New Candidate: {{ $json.firstName }} {{ $json.lastName }}",
  "attachments": [{
    "color": "{{ $json.score > 80 ? 'good' : 'warning' }}",
    "fields": [
      {
        "title": "Position",
        "value": "{{ $json.positionTitle }}",
        "short": true
      },
      {
        "title": "Score",
        "value": "{{ $json.score }}/100",
        "short": true
      },
      {
        "title": "Email",
        "value": "{{ $json.email }}",
        "short": false
      }
    ],
    "actions": [
      {
        "type": "button",
        "text": "Approve",
        "url": "{{ $env.N8N_URL }}/webhook/approve-candidate/{{ $json.candidateId }}"
      },
      {
        "type": "button",
        "text": "Reject",
        "style": "danger",
        "url": "{{ $env.N8N_URL }}/webhook/reject-candidate/{{ $json.candidateId }}"
      }
    ]
  }]
}
```

**Node 12: Create Employee**
```javascript
// Code Node: Prepare Employee Data
const candidate = $('Supabase - Get Candidate').first().json;
const personnelNumber = $('Generate Personnel Number').first().json.personnel_number;

return {
  json: {
    personnel_number: personnelNumber,
    candidate_id: candidate.id,
    first_name: candidate.first_name,
    last_name: candidate.last_name,
    email: candidate.email,
    phone: candidate.phone,
    date_of_birth: candidate.date_of_birth,
    position_id: candidate.position_id,
    org_unit_id: $json.org_unit_id,
    start_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days from now
    status: 'active'
  }
};
```

**Node 17: Welcome Email Template**
```html
<!-- HTML Email Template -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Willkommen bei Global Bike!</h1>
    </div>
    <div class="content">
      <p>Hallo {{ $json.firstName }},</p>
      
      <p>herzlich willkommen im Team! Wir freuen uns sehr, dass du ab dem <strong>{{ $json.startDate }}</strong> bei uns startest.</p>
      
      <div class="info-box">
        <h3>📋 Deine Details:</h3>
        <ul>
          <li><strong>Personalnummer:</strong> {{ $json.personnelNumber }}</li>
          <li><strong>Position:</strong> {{ $json.positionTitle }}</li>
          <li><strong>Abteilung:</strong> {{ $json.orgUnitName }}</li>
          <li><strong>Start:</strong> {{ $json.startDate }}</li>
        </ul>
      </div>
      
      <div class="info-box">
        <h3>🚀 Nächste Schritte:</h3>
        <ol>
          <li><strong>Tag 1:</strong> Onboarding Meeting um 9:00 Uhr</li>
          <li><strong>Woche 1:</strong> IT-Setup & Zugänge einrichten</li>
          <li><strong>Woche 2:</strong> Team Kennenlernen</li>
        </ol>
      </div>
      
      <p>Im Anhang findest du deine Onboarding-Checkliste. Bei Fragen stehe ich dir gerne zur Verfügung!</p>
      
      <p>Freundliche Grüße,<br>
      <strong>HR Team</strong><br>
      Global Bike Inc.</p>
    </div>
    <div class="footer">
      <p>Global Bike Inc. | Dallas, TX | hr@globalbike.com</p>
    </div>
  </div>
</body>
</html>
```

---

### 2.2 Workflow 2: Process II - Payroll (n8n-workflows/02_Process_II_Payroll.json)

**Trigger:** Cron (Monthly on 25th at 00:00)

**Nodes:**

```
1. Schedule Trigger (Cron: 0 0 25 * *)
   ↓
2. Set Period Variables
   ↓
3. Supabase: Get All Active Employees
   ↓
4. Loop: For Each Employee
   ↓
5. Supabase: Get Salary Data
   ↓
6. Supabase: Get Bank Details
   ↓
7. Function: Calculate Payroll (Supabase Function)
   ↓
8. Supabase: Create Payroll Run Record
   ↓
9. HTTP: Generate PDF (Mock Service)
   ↓
10. Supabase: Update Payroll with PDF URL
    ↓
11. Email: Send Payslip
    ↓
12. IF: All Processed?
    ├─ YES → Generate Summary Report
    └─ NO → Continue Loop
    ↓
13. Slack: Send Summary to Finance Team
    ↓
14. Log to Audit
```

**Detaillierte Nodes:**

**Node 2: Set Variables**
```javascript
// Code Node
const now = new Date();
const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const paymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);

return {
  json: {
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    payment_date: paymentDate.toISOString().split('T')[0],
    period_label: `${periodStart.toLocaleDateString('de-DE', {month: 'long', year: 'numeric'})}`
  }
};
```

**Node 7: Calculate Payroll**
```javascript
// HTTP Request to Supabase Function
const employee = $input.first().json;
const salary = $('Get Salary Data').first().json;

return {
  json: {
    method: 'POST',
    url: `${process.env.SUPABASE_URL}/rest/v1/rpc/calculate_payroll`,
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      p_employee_id: employee.id,
      p_period_start: $('Set Period').first().json.period_start,
      p_period_end: $('Set Period').first().json.period_end
    }
  }
};
```

**Node 9: Generate PDF**
```javascript
// HTTP Request to Mock PDF Service (GitHub Action)
const employee = $('Get Employee').first().json;
const payroll = $('Calculate Payroll').first().json;
const bank = $('Get Bank Details').first().json;

return {
  json: {
    method: 'POST',
    url: 'https://api.github.com/repos/YOUR_USERNAME/hcm-automation/dispatches',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: {
      event_type: 'generate-payslip',
      client_payload: {
        employee: employee,
        payroll: payroll,
        bank: bank,
        period: $('Set Period').first().json.period_label,
        callback_url: `${process.env.N8N_URL}/webhook/payslip-generated`
      }
    }
  }
};
```

---

### 2.3 Workflow 3: HR Approval (Interactive Form)

**Trigger:** Webhook + n8n Form

**Node Structure:**
```
1. Webhook: /webhook/candidate-review/:id
   ↓
2. Supabase: Get Candidate Details
   ↓
3. Supabase: Get Position Details
   ↓
4. n8n Form: Show Approval Form
   ↓
5. Wait for Submission (Timeout: 48h)
   ↓
6. Process Form Response
   ↓
7. Supabase: Update Candidate Status
   ↓
8. IF: Approved?
   ├─ YES → Trigger Onboarding Workflow
   └─ NO → Send Rejection Email
```

**Node 4: n8n Form Configuration**
```json
{
  "formTitle": "Candidate Review: {{ $json.firstName }} {{ $json.lastName }}",
  "formDescription": "Please review this candidate application",
  "formFields": [
    {
      "fieldLabel": "Candidate Name",
      "fieldType": "text",
      "requiredField": false,
      "defaultValue": "{{ $json.firstName }} {{ $json.lastName }}",
      "readOnly": true
    },
    {
      "fieldLabel": "Position",
      "fieldType": "text",
      "defaultValue": "{{ $json.positionTitle }}",
      "readOnly": true
    },
    {
      "fieldLabel": "Qualification Score",
      "fieldType": "number",
      "defaultValue": "{{ $json.qualificationScore }}",
      "readOnly": true
    },
    {
      "fieldLabel": "Decision",
      "fieldType": "dropdown",
      "fieldOptions": {
        "values": [
          { "option": "Hire" },
          { "option": "Interview" },
          { "option": "Reject" }
        ]
      },
      "requiredField": true
    },
    {
      "fieldLabel": "Start Date (if hiring)",
      "fieldType": "date",
      "requiredField": false
    },
    {
      "fieldLabel": "Salary Offer (EUR)",
      "fieldType": "number",
      "requiredField": false,
      "defaultValue": "{{ ($json.salaryMin + $json.salaryMax) / 2 }}"
    },
    {
      "fieldLabel": "Comments",
      "fieldType": "textarea",
      "requiredField": false
    }
  ],
  "submitButtonText": "Submit Decision"
}
```

---

## 🎨 STEP 3: Frontend Applications

### 3.1 Bewerbungsportal (frontend/bewerbungsportal/index.html)

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Global Bike - Karriere</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .logo p {
            color: #666;
            font-size: 1.1em;
        }
        .form-group {
            margin-bottom: 25px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        textarea {
            resize: vertical;
            min-height: 120px;
        }
        .file-upload {
            border: 2px dashed #e0e0e0;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .file-upload:hover {
            border-color: #667eea;
            background: #f8f9ff;
        }
        .file-upload input[type="file"] {
            display: none;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .success-message {
            display: none;
            text-align: center;
            padding: 20px;
        }
        .success-message.show {
            display: block;
        }
        .success-message svg {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }
        .required {
            color: red;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🚴 Global Bike</h1>
            <p>Join Our Team</p>
        </div>

        <form id="applicationForm">
            <div class="form-group">
                <label>Vorname <span class="required">*</span></label>
                <input type="text" name="firstName" required>
            </div>

            <div class="form-group">
                <label>Nachname <span class="required">*</span></label>
                <input type="text" name="lastName" required>
            </div>

            <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input type="email" name="email" required>
            </div>

            <div class="form-group">
                <label>Telefon</label>
                <input type="tel" name="phone" placeholder="+49 170 1234567">
            </div>

            <div class="form-group">
                <label>Geburtsdatum <span class="required">*</span></label>
                <input type="date" name="dateOfBirth" required>
            </div>

            <div class="form-group">
                <label>Position <span class="required">*</span></label>
                <select name="positionId" id="positionSelect" required>
                    <option value="">Bitte wählen...</option>
                </select>
            </div>

            <div class="form-group">
                <label>Berufserfahrung (Jahre)</label>
                <input type="number" name="experience" min="0" max="50">
            </div>

            <div class="form-group">
                <label>Ausbildung</label>
                <input type="text" name="education" placeholder="z.B. Bachelor Computer Science">
            </div>

            <div class="form-group">
                <label>Skills (kommagetrennt)</label>
                <input type="text" name="skills" placeholder="JavaScript, React, Node.js">
            </div>

            <div class="form-group">
                <label>Anschreiben</label>
                <textarea name="coverLetter" placeholder="Warum möchten Sie bei uns arbeiten?"></textarea>
            </div>

            <div class="form-group">
                <label>Lebenslauf (PDF) <span class="required">*</span></label>
                <div class="file-upload" onclick="document.getElementById('cvFile').click()">
                    <input type="file" id="cvFile" name="cv" accept=".pdf" required>
                    <p>📄 Klicken zum Hochladen</p>
                    <p style="font-size: 14px; color: #999; margin-top: 10px;">Maximale Größe: 5MB</p>
                </div>
            </div>

            <button type="submit" id="submitBtn">
                Bewerbung absenden 🚀
            </button>
        </form>

        <div class="success-message" id="successMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke="#4CAF50"/>
                <path d="M9 12l2 2 4-4" stroke="#4CAF50"/>
            </svg>
            <h2 style="color: #4CAF50; margin-bottom: 10px;">Bewerbung erfolgreich!</h2>
            <p style="color: #666;">Wir haben Ihre Unterlagen erhalten und melden uns in Kürze bei Ihnen.</p>
            <p style="margin-top: 20px;">
                <a href="#" onclick="location.reload()" style="color: #667eea;">Weitere Bewerbung einreichen</a>
            </p>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

**app.js:**
```javascript
// Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL/candidate-apply';

// Load available positions
async function loadPositions() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/positions?status=eq.vacant&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const positions = await response.json();
        const select = document.getElementById('positionSelect');
        
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos.id;
            option.textContent = `${pos.position_title} - ${pos.org_unit_id}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading positions:', error);
    }
}

// File upload preview
document.getElementById('cvFile').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name;
    if (fileName) {
        e.target.parentElement.querySelector('p').textContent = `📄 ${fileName}`;
    }
});

// Form submission
document.getElementById('applicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Convert FormData to JSON
    for (let [key, value] of formData.entries()) {
        if (key !== 'cv') {
            data[key] = value;
        }
    }
    
    try {
        // Submit to n8n webhook
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            // Show success message
            document.getElementById('applicationForm').style.display = 'none';
            document.getElementById('successMessage').classList.add('show');
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        alert('Fehler beim Absenden. Bitte versuchen Sie es später erneut.');
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Bewerbung absenden 🚀';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadPositions);
```

---

### 3.2 HR Dashboard (frontend/hr-dashboard/index.html)

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Dashboard - Global Bike</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }
        .navbar {
            background: #1a1a2e;
            color: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .navbar h1 {
            font-size: 24px;
        }
        .container {
            max-width: 1400px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .stat-card .number {
            font-size: 36px;
            font-weight: bold;
            color: #1a1a2e;
        }
        .stat-card .trend {
            color: #4CAF50;
            font-size: 14px;
            margin-top: 10px;
        }
        .candidates-section {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .section-header h2 {
            font-size: 24px;
        }
        .filter-buttons {
            display: flex;
            gap: 10px;
        }
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .filter-btn.active {
            background: #1a1a2e;
            color: white;
            border-color: #1a1a2e;
        }
        .candidates-table {
            width: 100%;
            border-collapse: collapse;
        }
        .candidates-table thead {
            background: #f9f9f9;
        }
        .candidates-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #666;
        }
        .candidates-table td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .candidates-table tr:hover {
            background: #f9f9f9;
        }
        .score-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .score-high { background: #e8f5e9; color: #4CAF50; }
        .score-medium { background: #fff3e0; color: #FF9800; }
        .score-low { background: #ffebee; color: #f44336; }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-applied { background: #e3f2fd; color: #2196F3; }
        .status-review { background: #fff3e0; color: #FF9800; }
        .status-interview { background: #f3e5f5; color: #9C27B0; }
        .status-hired { background: #e8f5e9; color: #4CAF50; }
        .status-rejected { background: #ffebee; color: #f44336; }
        .action-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 5px;
        }
        .btn-review {
            background: #2196F3;
            color: white;
        }
        .btn-approve {
            background: #4CAF50;
            color: white;
        }
        .btn-reject {
            background: #f44336;
            color: white;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🚴 Global Bike - HR Dashboard</h1>
        <div>
            <span>👤 HR Manager</span>
        </div>
    </div>

    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <h3>OFFENE STELLEN</h3>
                <div class="number" id="openPositions">-</div>
                <div class="trend">↑ 2 diese Woche</div>
            </div>
            <div class="stat-card">
                <h3>NEUE BEWERBUNGEN</h3>
                <div class="number" id="newApplications">-</div>
                <div class="trend">↑ 12 diese Woche</div>
            </div>
            <div class="stat-card">
                <h3>ZU PRÜFEN</h3>
                <div class="number" id="toReview">-</div>
                <div class="trend">Benötigt Aktion</div>
            </div>
            <div class="stat-card">
                <h3>EINSTELLUNGEN (30T)</h3>
                <div class="number" id="hiredCount">-</div>
                <div class="trend">🎯 Ziel: 10</div>
            </div>
        </div>

        <div class="candidates-section">
            <div class="section-header">
                <h2>Bewerbungen</h2>
                <div class="filter-buttons">
                    <button class="filter-btn active" onclick="filterCandidates('all')">Alle</button>
                    <button class="filter-btn" onclick="filterCandidates('applied')">Neu</button>
                    <button class="filter-btn" onclick="filterCandidates('review')">Zu prüfen</button>
                    <button class="filter-btn" onclick="filterCandidates('interview')">Interview</button>
                    <button class="filter-btn" onclick="filterCandidates('hired')">Eingestellt</button>
                </div>
            </div>

            <table class="candidates-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Score</th>
                        <th>Datum</th>
                        <th>Status</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody id="candidatesTableBody">
                    <!-- Dynamically populated -->
                </tbody>
            </table>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>
```

**dashboard.js:**
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const N8N_WEBHOOK = 'YOUR_N8N_WEBHOOK_URL';

let allCandidates = [];

// Fetch data
async function fetchDashboardData() {
    try {
        // Fetch stats
        const [positions, candidates] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/positions?select=count`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'count=exact'
                }
            }),
            fetch(`${SUPABASE_URL}/rest/v1/candidates?select=*,positions(position_title)&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            })
        ]);

        const candidatesData = await candidates.json();
        allCandidates = candidatesData;

        // Update stats
        document.getElementById('openPositions').textContent = 
            candidatesData.filter(c => c.status === 'vacant').length;
        document.getElementById('newApplications').textContent = 
            candidatesData.filter(c => c.status === 'applied').length;
        document.getElementById('toReview').textContent = 
            candidatesData.filter(c => c.status === 'review').length;
        document.getElementById('hiredCount').textContent = 
            candidatesData.filter(c => c.status === 'hired').length;

        // Render table
        renderCandidatesTable(candidatesData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render candidates table
function renderCandidatesTable(candidates) {
    const tbody = document.getElementById('candidatesTableBody');
    tbody.innerHTML = '';

    candidates.forEach(candidate => {
        const row = document.createElement('tr');
        
        const scoreClass = candidate.qualification_score >= 80 ? 'score-high' : 
                          candidate.qualification_score >= 60 ? 'score-medium' : 
                          'score-low';
        
        row.innerHTML = `
            <td><strong>${candidate.first_name} ${candidate.last_name}</strong><br>
                <small style="color: #999;">${candidate.email}</small>
            </td>
            <td>${candidate.positions?.position_title || 'N/A'}</td>
            <td><span class="score-badge ${scoreClass}">${candidate.qualification_score || 'N/A'}</span></td>
            <td>${new Date(candidate.created_at).toLocaleDateString('de-DE')}</td>
            <td><span class="status-badge status-${candidate.status}">${candidate.status}</span></td>
            <td>
                ${candidate.status === 'applied' || candidate.status === 'review' ? `
                    <button class="action-btn btn-review" onclick="reviewCandidate('${candidate.id}')">
                        👁️ Review
                    </button>
                    <button class="action-btn btn-approve" onclick="approveCandidate('${candidate.id}')">
                        ✅ Einstellen
                    </button>
                    <button class="action-btn btn-reject" onclick="rejectCandidate('${candidate.id}')">
                        ❌ Ablehnen
                    </button>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filter candidates
function filterCandidates(status) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter and render
    const filtered = status === 'all' ? 
        allCandidates : 
        allCandidates.filter(c => c.status === status);
    
    renderCandidatesTable(filtered);
}

// Actions
async function reviewCandidate(id) {
    const url = `${N8N_WEBHOOK}/candidate-review/${id}`;
    window.open(url, '_blank');
}

async function approveCandidate(id) {
    if (confirm('Diesen Kandidaten einstellen?')) {
        try {
            await fetch(`${N8N_WEBHOOK}/approve-candidate/${id}`, {
                method: 'POST'
            });
            alert('Candidate approved! Onboarding process started.');
            fetchDashboardData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}

async function rejectCandidate(id) {
    const reason = prompt('Ablehnungsgrund:');
    if (reason) {
        try {
            await fetch(`${N8N_WEBHOOK}/reject-candidate/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            alert('Candidate rejected.');
            fetchDashboardData();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    // Refresh every 30 seconds
    setInterval(fetchDashboardData, 30000);
});
```

---

## 🔧 STEP 4: Mock Services (GitHub Actions)

### 4.1 Mock SAP API (.github/workflows/mock-sap-api.yml)

```yaml
name: Mock SAP API

on:
  repository_dispatch:
    types: [sap-api-call]

jobs:
  process-request:
    runs-on: ubuntu-latest
    steps:
      - name: Process SAP Request
        run: |
          echo "Processing SAP API call"
          echo "Transaction: ${{ github.event.client_payload.transaction }}"
          echo "Data: ${{ github.event.client_payload.data }}"
          
      - name: Simulate Processing
        run: sleep 2
      
      - name: Send Response
        env:
          CALLBACK_URL: ${{ github.event.client_payload.callback_url }}
        run: |
          curl -X POST "$CALLBACK_URL" \
            -H "Content-Type: application/json" \
            -d '{
              "success": true,
              "sap_document_number": "DOC-'$(date +%s)'",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "message": "SAP transaction completed successfully"
            }'
```

### 4.2 PDF Generator (.github/workflows/pdf-generator.yml)

```yaml
name: PDF Generator Service

on:
  repository_dispatch:
    types: [generate-payslip]

jobs:
  generate-pdf:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm install puppeteer
      
      - name: Generate PDF
        run: |
          node << 'EOF'
          const puppeteer = require('puppeteer');
          const fs = require('fs');
          
          const data = ${{ toJson(github.event.client_payload) }};
          
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial; padding: 40px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                .total { font-weight: bold; background: #f0f0f0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Global Bike Inc.</h1>
                <h2>Gehaltsabrechnung</h2>
                <p>${data.period}</p>
              </div>
              
              <h3>Mitarbeiter: ${data.employee.first_name} ${data.employee.last_name}</h3>
              <p>Personalnummer: ${data.employee.personnel_number}</p>
              
              <table>
                <tr><th>Beschreibung</th><th>Betrag (EUR)</th></tr>
                <tr><td>Bruttogehalt</td><td>${data.payroll.gross_salary}</td></tr>
                <tr><td>Steuerabzug</td><td>-${data.payroll.tax_deduction}</td></tr>
                <tr><td>Sozialversicherung</td><td>-${data.payroll.social_security}</td></tr>
                <tr class="total"><td>Netto</td><td>${data.payroll.net_salary}</td></tr>
              </table>
              
              <h3>Bankverbindung</h3>
              <p>IBAN: ${data.bank.iban}<br>
              Bank: ${data.bank.bank_name}</p>
            </body>
            </html>
          `;
          
          (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html);
            await page.pdf({ 
              path: 'payslip.pdf',
              format: 'A4'
            });
            await browser.close();
            
            const pdf = fs.readFileSync('payslip.pdf', 'base64');
            console.log('PDF_BASE64=' + pdf);
          })();
          EOF
      
      - name: Upload to Temporary Storage
        id: upload
        run: |
          # In production, upload to S3/Cloudflare R2/etc
          # For demo, we'll use a simple file.io service
          UPLOAD_RESPONSE=$(curl -F "file=@payslip.pdf" https://file.io/?expires=7d)
          PDF_URL=$(echo $UPLOAD_RESPONSE | jq -r '.link')
          echo "pdf_url=$PDF_URL" >> $GITHUB_OUTPUT
      
      - name: Send Callback
        env:
          CALLBACK_URL: ${{ github.event.client_payload.callback_url }}
          PDF_URL: ${{ steps.upload.outputs.pdf_url }}
        run: |
          curl -X POST "$CALLBACK_URL" \
            -H "Content-Type: application/json" \
            -d "{
              \"success\": true,
              \"pdf_url\": \"$PDF_URL\",
              \"employee_id\": \"${{ github.event.client_payload.employee.id }}\"
            }"
```

---

## 🚀 STEP 5: Deployment Guide

### 5.1 Quick Start Script (deploy.sh)

```bash
#!/bin/bash

echo "🚀 Deploying HCM Automation System"
echo "===================================="

# 1. Setup Supabase
echo "📊 Setting up Supabase..."
echo "1. Go to https://supabase.com"
echo "2. Create new project"
echo "3. Run migrations from supabase/migrations/"
echo "4. Copy your project URL and anon key"
read -p "Press enter when done..."

# 2. Setup n8n
echo "🌊 Setting up n8n..."
echo "Choose deployment method:"
echo "1. Docker (Recommended)"
echo "2. npm"
echo "3. n8n.cloud"
read -p "Enter choice (1-3): " n8n_choice

case $n8n_choice in
  1)
    echo "Starting n8n with Docker..."
    docker run -it --rm \
      --name n8n \
      -p 5678:5678 \
      -v ~/.n8n:/home/node/.n8n \
      n8nio/n8n
    ;;
  2)
    echo "Installing n8n via npm..."
    npm install -g n8n
    n8n start
    ;;
  3)
    echo "Go to https://n8n.cloud and create account"
    ;;
esac

# 3. Import Workflows
echo "📥 Import workflows:"
echo "1. Open n8n at http://localhost:5678"
echo "2. Go to Workflows > Import from File"
echo "3. Import all files from n8n-workflows/"
read -p "Press enter when done..."

# 4. Setup Frontend
echo "🎨 Deploying Frontend..."
echo "Choose hosting:"
echo "1. GitHub Pages (Free)"
echo "2. Vercel (Recommended)"
echo "3. Netlify"
read -p "Enter choice (1-3): " hosting_choice

case $hosting_choice in
  1)
    echo "Push frontend/ to GitHub and enable Pages in Settings"
    ;;
  2)
    npm install -g vercel
    cd frontend && vercel --prod
    ;;
  3)
    npm install -g netlify-cli
    cd frontend && netlify deploy --prod
    ;;
esac

echo "✅ Deployment Complete!"
echo "Next steps:"
echo "1. Configure environment variables in n8n"
echo "2. Test workflows with sample data"
echo "3. Access dashboards and test end-to-end"
```

---

## 📚 STEP 6: Documentation

### README.md

```markdown
# 🚀 HCM Automation System

Complete HR automation with n8n, Supabase, and GitHub.

## Features

- ✅ Automated Candidate Processing
- ✅ AI-Powered Screening (Claude/GPT)
- ✅ Interactive Approval Forms
- ✅ Payroll Calculation & PDF Generation
- ✅ Real-time Dashboard
- ✅ Email Notifications
- ✅ Audit Logging

## Architecture

```
Applicant Portal → n8n Workflows → Supabase → HR Dashboard
                        ↓
                  GitHub Actions (Mock Services)
```

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/hcm-automation.git
cd hcm-automation

# 2. Setup Supabase
# - Create project at supabase.com
# - Run migrations from supabase/migrations/

# 3. Deploy n8n
docker run -d -p 5678:5678 --name n8n n8nio/n8n

# 4. Import workflows
# - Open http://localhost:5678
# - Import from n8n-workflows/

# 5. Deploy frontend
cd frontend/bewerbungsportal
# Update config in app.js
# Deploy to GitHub Pages/Vercel/Netlify
```

## Configuration

### Environment Variables (n8n)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GITHUB_TOKEN=your-github-token
ANTHROPIC_API_KEY=your-claude-key
SLACK_WEBHOOK=your-slack-webhook
N8N_URL=https://your-n8n-instance.com
```

## Workflows

### 01_Process_I_Onboarding
- Trigger: Webhook on new application
- Steps: Validate → Score → Notify → Approve → Hire

### 02_Process_II_Payroll
- Trigger: Cron (monthly)
- Steps: Calculate → Generate PDF → Send Payslip

### 03_HR_Approval
- Trigger: Manual/Auto
- Interactive form for hiring decisions

## Testing

1. Submit test application via portal
2. Check n8n execution log
3. Verify in Supabase
4. Check HR dashboard

## Production Checklist

- [ ] Enable Supabase RLS policies
- [ ] Setup email domain (SendGrid/Mailgun)
- [ ] Configure rate limiting
- [ ] Setup monitoring (Sentry/LogRocket)
- [ ] Backup database regularly
- [ ] SSL certificates for all domains

## Support

Issues: https://github.com/YOUR_USERNAME/hcm-automation/issues
```

---

## 🎉 FINAL RESULT

Nach Setup hast du:

✅ **Bewerbungsportal** - Candidates können sich bewerben
✅ **n8n Automation** - Alles läuft automatisch
✅ **AI Screening** - Claude scored Kandidaten
✅ **HR Dashboard** - Echtzeit-Übersicht
✅ **Payroll System** - Automatische Gehaltsabrechnung
✅ **PDF Generation** - Payslips automatisch
✅ **Email System** - Notifications & Reports
✅ **Mock SAP** - GitHub Actions simuliert Backend

**Setup Zeit:** ~2-3 Stunden
**Kosten:** $0 (alles free tier)
**Maintainability:** 10/10

---

## 💡 NEXT STEPS

1. Clone/Create GitHub Repo
2. Setup Supabase
3. Deploy n8n (Docker oder Cloud)
4. Import Workflows
5. Deploy Frontends
6. Test End-to-End
7. 🎉 Demo ready!

Soll ich dir noch:
- Die kompletten n8n Workflow JSONs generieren?
- Ein Docker Compose File für alles?
- Oder direkt loslegen und alles erstellen?
