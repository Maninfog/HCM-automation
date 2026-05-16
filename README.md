# HCM Automation — RPA Prototyp

> Hochschul-Projekt · Informationssysteme 2 · SS 2026  
> Demonstriert den Einsatz von RPA/Workflow-Automation in einem Human Capital Management Prozess.

**Live-Demo:** [hcm-automation.vercel.app](https://hcm-automation.vercel.app)

---

## Überblick

Dieses Projekt zeigt, wie moderne Automatisierung (n8n) und ein reaktives Frontend (React + Supabase) zusammenspielen, um zwei HCM-Kernprozesse abzubilden:

| Prozess | Schritte | Besonderheit |
|---------|----------|-------------|
| **I — Onboarding** | Bewerbungseingang → HR-Entscheidung → Einstellung | 3 n8n-Workflows, klare Human/Robot-Trennung |
| **II — Payroll** | Gehaltsabrechnung per Webhook auslösen | 1 n8n-Workflow, vollautomatisch |

Jeder Prozessschritt wird als `process_event` in Supabase geloggt — mit explizitem `path_type: human` oder `path_type: robot`. Das Frontend zeigt diese Timeline live.

---

## Human Path vs. Robot Path

```
Prozess I — Onboarding
───────────────────────────────────────────────────────
[ROBOT]  I-04  Bewerbung einlesen, CV-Score berechnen
           └─► Mail an HR: "Neue Bewerbung — bitte prüfen"
[HUMAN]  I-05  HR entscheidet: hire / interview / reject
           └─► Bei hire: I-07 automatisch getriggert
[ROBOT]  I-07  Personalnummer generieren, Mitarbeiter anlegen
           └─► Mail an HR: "Prozess I abgeschlossen"

Prozess II — Payroll
───────────────────────────────────────────────────────
[ROBOT]  II-04  Gehaltsabrechnung berechnen & speichern
           └─► Mail an HR: "Payroll abgeschlossen"
```

---

## Stack

| Komponente | Technologie |
|-----------|-------------|
| **Frontend** | React 19, TanStack Router, Tailwind CSS, shadcn/ui |
| **Datenbank** | Supabase (PostgreSQL + REST API) |
| **Automation** | n8n (self-hosted, Docker) |
| **E-Mail** | Resend API |
| **Hosting** | Vercel (Frontend), lokal (n8n) |

---

## Projektstruktur

```
hcm-automation/
├── flow-insights/          # React-Frontend (Vite SPA → Vercel)
│   ├── src/routes/         # /, /apply, /hr, /hr/process/:id
│   ├── src/lib/api.ts      # Supabase + n8n Webhooks
│   └── vercel.json
├── n8n-workflows/          # Importierbare n8n Workflow JSONs
│   ├── 02_Process_II_Payroll.json
│   ├── 05_Step_I04_CandidateIngest.json   [ROBOT]
│   ├── 06_Step_I05_HRDecision.json        [HUMAN]
│   └── 07_Step_I07_HireCandidate.json     [ROBOT]
├── supabase/
│   └── migrations/         # 001 Schema, 002 RPC, 003 process_events
├── frontend/               # Statisches Legacy-Frontend (Hub)
└── docs/                   # WORKFLOWS.md, SETUP.md
```

---

## Schnellstart

### 1. Supabase

Führe die Migrations in dieser Reihenfolge im Supabase SQL-Editor aus:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_functions_and_rpc.sql
supabase/migrations/003_process_events.sql
```

### 2. n8n (Docker)

```bash
docker compose up -d
```

Dann alle 4 Workflows aus `n8n-workflows/` importieren und aktivieren:

| Datei | Trigger |
|-------|---------|
| `05_Step_I04_CandidateIngest.json` | `POST /webhook/hcm/step/i04-candidate-ingest` |
| `06_Step_I05_HRDecision.json` | `POST /webhook/hcm/step/i05-hr-decision` |
| `07_Step_I07_HireCandidate.json` | `POST /webhook/hcm/step/i07-hire-candidate` |
| `02_Process_II_Payroll.json` | `POST /webhook/hcm/step/ii-payroll-run` |

Credentials in n8n setzen: Supabase Service Role Key + Resend API Key.

### 3. Demo-Flow testen

```bash
# Schritt 1 — Bewerbung einreichen (Robot)
curl -X POST http://localhost:5678/webhook/hcm/step/i04-candidate-ingest \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Anna","lastName":"Demo","email":"anna@example.com",
       "positionId":"<uuid>","experience":"3 Jahre","education":"Bachelor"}'

# Schritt 2 — HR-Entscheidung (Human)
curl -X POST http://localhost:5678/webhook/hcm/step/i05-hr-decision \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"<uuid>","decision":"hire"}'

# Schritt 3 — Payroll auslösen (Robot)
curl -X POST http://localhost:5678/webhook/hcm/step/ii-payroll-run \
  -H "Content-Type: application/json" \
  -d '{"period":"2026-05"}'
```

### 4. Frontend (Vercel)

Environment Variables in Vercel setzen:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_N8N_APPLY_WEBHOOK=http://localhost:5678/webhook/hcm/step/i04-candidate-ingest
VITE_N8N_DECISION_WEBHOOK=http://localhost:5678/webhook/hcm/step/i05-hr-decision
```

> Die Webhook-Variablen sind optional — ohne sie läuft das Frontend im Mock-Modus.

---

## Hinweise

- Die `calculate_payroll` RPC-Funktion ist eine **Demo-Implementierung** ohne rechtliche Gültigkeit.
- Der Supabase **Service Role Key** darf niemals im Frontend oder Git landen — nur in n8n.
- Import-Dateien mit echten Credentials (`*.import.json`) sind in `.gitignore` ausgeschlossen.
