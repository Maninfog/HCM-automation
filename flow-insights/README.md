# HCM Automation Demo

Enterprise-Demo-UI für Onboarding & Payroll mit klarer **HUMAN** / **ROBOT** Pfad-Visualisierung. SAP/Fiori-inspiriert, modernisiert.

## Stack

- TanStack Start (React 19, Vite 7, File-Routing, SSR)
- Tailwind CSS v4 + shadcn/ui
- TanStack Query für Data Fetching
- Supabase JS (lazy, optional) — fällt automatisch auf Mockdaten zurück
- n8n Webhooks für Apply + Decision

## Setup

```bash
bun install
bun dev
```

Öffne http://localhost:8080.

## Environment

Lege optional `.env.local` an (nichts hardcoden):

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_N8N_APPLY_WEBHOOK=https://n8n.example.com/webhook/apply
VITE_N8N_DECISION_WEBHOOK=https://n8n.example.com/webhook/decision
```

Ohne ENV läuft die App im **Mock-Modus** mit realistischen Daten — der Status wird in der TopBar angezeigt.

## Erwartetes Supabase-Schema

| Tabelle | Felder (Auszug) |
|---|---|
| `positions` | id, title, department, location |
| `candidates` | id, full_name, email, position_id, score, status, last_step, last_path, created_at, updated_at |
| `process_events` | id, process_id, process_type, candidate_id, step_code, **path_type ('human'\|'robot')**, status, message, payload (jsonb), created_at |
| `payroll_runs` | (optional, kommendes Modul) |

`status` für `process_events`: `pending` · `running` · `waiting_approval` · `success` · `failed`.

## n8n Webhooks

**Apply** (`VITE_N8N_APPLY_WEBHOOK`):
```json
POST { "full_name": "...", "email": "...", "position_id": "...", "cv_url": "...", "cover_letter": "..." }
```

**Decision** (`VITE_N8N_DECISION_WEBHOOK`):
```json
POST { "candidate_id": "...", "decision": "interview" | "hire" | "reject", "note": "..." }
```

Wenn der Webhook nicht erreichbar ist, wird ein lokales Mock-Event erzeugt + Toast eingeblendet.

> Stelle in deinem n8n-Webhook-Node die CORS-Header so ein, dass der Browser POSTen darf (`Access-Control-Allow-Origin: *` für die Demo).

## Routes

- `/` — Executive Overview (KPIs, Recent Events, Human/Robot-Anteil)
- `/apply` — Bewerbungsportal (Form → Apply-Webhook)
- `/hr` — HR Dashboard (Kandidatenliste mit Filtern)
- `/hr/process/$id` — Prozessdetail mit Timeline + Human Action Panel

## Deploy

In Lovable: **Publish**-Button (Cloudflare Workers). Für Vercel-Export siehe TanStack Start Vercel-Adapter (`@tanstack/react-start/server-functions-vercel`).

## Design-Tokens (siehe `src/styles.css`)

- `--primary`: Enterprise Blue (~ SAP #0A6ED1)
- `--path-human`, `--path-robot`: zentrale Pfad-Marker
- `--status-success|warning|error|info|pending` (+ `-soft` Variante)
- Radius 6px, subtile Shadows, dichte Tabellen

Alle `PathBadge` / `StatusBadge` Komponenten sind die zentrale Quelle der Wahrheit für die HUMAN/ROBOT-Visualisierung.
