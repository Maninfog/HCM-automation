# n8n Workflows

| Datei | Zweck |
|-------|--------|
| `01_Process_I_Onboarding.json` | Webhook Bewerbung: Upsert Kandidat, Demo-Score, Status `review` ab Score ≥ 80 |
| `02_Process_II_Payroll.json` | Manuell: ein aktiver Mitarbeiter (Limit 1), `calculate_payroll` RPC, Insert `payroll_runs` |
| `03_HR_Approval_Workflow.json` | Webhook Entscheidung `hire` / `interview` / `reject` → PATCH `candidates` |
| `04_Reporting_Dashboard.json` | Zeitplan: alle 24h Zähler „applied“, optional Slack |

## Hinweise

- **01** nutzt **keine** echten LLM-Credentials — Scoring ist heuristisch (`Demo Score`). Anthropic/ OpenAI Node später einbauen (siehe Original-Guide).
- **02** braucht mindestens einen **aktiven** Mitarbeiter + Zeile in **`salary_data`** — Seed `demo_employee_for_payroll.sql` erzeugt das.
- HTTP-Nodes setzen Header per Expression aus `SUPABASE_SERVICE_KEY` — in n8n **Environment** anlegen oder auf Credentials umstellen.
