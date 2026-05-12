# HCM — REST (PostgREST)

Basis: `SUPABASE_URL` + Header

- `apikey: <key>`
- `Authorization: Bearer <key>`

## Tabellen (Auszug)

| Tabelle | Zweck |
|---------|--------|
| `organizational_units` | Organisationseinheiten |
| `positions` | Planstellen |
| `candidates` | Bewerber |
| `employees` | Mitarbeiter |
| `salary_data` | Gehaltsbasis |
| `payroll_runs` | Lohnläufe |
| `audit_log` | Audit |

## RPC

- `POST /rest/v1/rpc/calculate_payroll`  
  Body: `{ "p_employee_id": "<uuid>", "p_period_start": "YYYY-MM-DD", "p_period_end": "YYYY-MM-DD" }`

- `GET`/`POST` je nach Setup: `generate_personnel_number()` — als SQL-Funktion; Aufruf z. B. über RPC wenn in Supabase freigegeben.

Filter-Beispiele: `?status=eq.applied`, `?email=eq.user@example.com` (E-Mail URL-encoden).
