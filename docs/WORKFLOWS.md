# n8n Workflows

## Überblick

| Datei | Schritt | Path | Zweck |
|-------|---------|------|-------|
| `01_Process_I_Onboarding.json` | — | — | Monolithischer Onboarding-Flow (Legacy, Referenz) |
| `02_Process_II_Payroll.json` | — | — | Manuell: Payroll-Run für aktiven Mitarbeiter |
| `03_HR_Approval_Workflow.json` | — | — | Legacy Approval-Webhook (einfach, kein Event-Log) |
| `04_Reporting_Dashboard.json` | — | — | Zeitplan: tägl. Kandidatenzähler, optional Slack |
| **`05_Step_I04_CandidateIngest.json`** | **I-04** | **ROBOT** | **Bewerbung verarbeiten, Score berechnen, Mail an HR** |
| **`06_Step_I05_HRDecision.json`** | **I-05** | **HUMAN** | **HR-Entscheidung hire/interview/reject, triggert I-07** |
| **`07_Step_I07_HireCandidate.json`** | **I-07** | **ROBOT** | **Mitarbeiter anlegen, Position füllen, Abschlussmail** |

---

## Human Path / Robot Path — Process I

```
Bewerbungsportal
      │
      ▼
┌─────────────────────────────────┐
│  I-04 — CandidateIngest         │  PATH: ROBOT
│  • Kandidat upserten            │  Webhook: POST /hcm/step/i04-candidate-ingest
│  • Score berechnen (Demo)       │  Event: process_events {path_type: 'robot', step_code: 'I-04'}
│  • Score in Supabase speichern  │  Mail: "I-04 abgeschlossen – bitte prüfen"
└──────────────┬──────────────────┘
               │ Robot sendet Mail an HR
               ▼
┌─────────────────────────────────┐
│  I-05 — HRDecision              │  PATH: HUMAN
│  • HR öffnet Link im Dashboard  │  Webhook: POST /hcm/step/i05-hr-decision
│  • Entscheidung: hire /         │  Event: process_events {path_type: 'human', step_code: 'I-05'}
│    interview / reject           │
└──────────────┬──────────────────┘
               │ decision = hire
               ▼
┌─────────────────────────────────┐
│  I-07 — HireCandidate           │  PATH: ROBOT
│  • Personalnummer generieren    │  Webhook: POST /hcm/step/i07-hire-candidate
│  • Employee-Datensatz anlegen   │  Event: process_events {path_type: 'robot', step_code: 'I-07'}
│  • Position → filled            │  Mail: "Prozess I abgeschlossen"
└─────────────────────────────────┘
```

---

## Webhook-URLs (nach n8n-Import)

| Workflow | Methode | Pfad |
|----------|---------|------|
| I-04 CandidateIngest | POST | `{N8N_BASE}/webhook/hcm/step/i04-candidate-ingest` |
| I-05 HRDecision | POST | `{N8N_BASE}/webhook/hcm/step/i05-hr-decision` |
| I-07 HireCandidate | POST | `{N8N_BASE}/webhook/hcm/step/i07-hire-candidate` |
| Legacy Onboarding | POST | `{N8N_BASE}/webhook/hcm/candidate-apply` |
| Legacy Decision | POST | `{N8N_BASE}/webhook/hcm/candidate-decision` |

---

## Umgebungsvariablen in n8n

Alle Variablen in n8n unter **Settings → Environment Variables** eintragen (oder via Docker `.env`).

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `SUPABASE_URL` | ✅ | Supabase Projekt-URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Service Role Key (nur n8n!) |
| `RESEND_API_KEY` | ✅ | API Key von resend.com |
| `HR_NOTIFY_EMAIL` | ✅ | Empfänger der Robot-Abschluss-Mails |
| `MAIL_DOMAIN` | ✅ | In Resend verifizierte Absender-Domain |
| `HCM_N8N_BASE_URL` | ✅ | n8n Instanz-URL (für I-05 → I-07 Trigger) |
| `HCM_DASHBOARD_URL` | empfohlen | Vercel-URL für Links in Mails |
| `SLACK_WEBHOOK_URL` | optional | Für Workflow 04 Reporting |

---

## Wichtige Hinweise

- **01** (Legacy) und **05–07** (Step-Flows) überlappen sich inhaltlich — für die Demo nur **05–07** aktivieren.
- **02** braucht mindestens einen aktiven Mitarbeiter + Zeile in `salary_data` — Seed `demo_employee_for_payroll.sql` liefert das.
- **process_events** Tabelle muss vor dem ersten Lauf angelegt sein: `supabase/migrations/003_process_events.sql`.
- Resend kostenlos bis 3.000 Mails/Monat; Domain-Verifizierung im Resend-Dashboard unter **Domains**.
