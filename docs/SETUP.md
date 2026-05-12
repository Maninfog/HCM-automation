# HCM Automation — Setup

## 1. Supabase

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im **SQL Editor** → **New query**: **nicht** den Dateipfad eintippen oder ausführen. Stattdessen jeweils die **komplette Datei im Repo öffnen**, **alles markieren**, **kopieren**, in den Editor **einfügen**, dann **Run**.

**Variante A — ein Rutsch (nur frisches/leeres Projekt):**  
Datei `supabase/install_all.sql` öffnen → **gesamten Inhalt** kopieren → SQL Editor → **Run**.

**Variante B — einzeln (Inhalt einfügen, nicht der Pfad als eine Zeile):**

| Schritt | Datei im Repo |
|--------|----------------|
| 1 | `supabase/migrations/001_initial_schema.sql` |
| 2 | `supabase/migrations/002_functions_and_rpc.sql` |
| 3 | `supabase/seed/test_data.sql` |
| 4 (optional) | `supabase/seed/demo_employee_for_payroll.sql` — damit n8n-Workflow **02** sofort einen aktiven Mitarbeiter + `salary_data` findet |

Mehr Infos: `supabase/RUN_IN_ORDER.md`.

**Typischer Fehler:** `ERROR: syntax error at or near "supabase"` — dann wurde z. B. `supabase/migrations/001_initial_schema.sql` **als Text** in die Query geschrieben. Das ist ein **Pfad**, kein SQL.

3. Unter **Settings → API** `Project URL` und **`service_role` Secret** kopieren — nur für **n8n** (Server), nie ins öffentliche Frontend mit Anon-Key mischen.

> **RLS:** Migration 001 erlaubt Demo-Zugriff für `anon` + `authenticated`. Für Produktion Policies verschärfen.

---

## 2. n8n

### Docker (empfohlen)

```bash
cd 02-projects/hcm-automation
cp .env.example .env
# .env ausfüllen: SUPABASE_URL, SUPABASE_SERVICE_KEY, optional SLACK_WEBHOOK_URL
docker compose up -d
```

Öffne `http://localhost:5678` → **Workflows importieren** (`n8n-workflows/*.json`).

### Umgebungsvariablen in n8n

| Variable | Verwendung |
|----------|------------|
| `SUPABASE_URL` | Basis-URL des Projekts |
| `SUPABASE_SERVICE_KEY` | Service Role Key (REST + RPC) |
| `SLACK_WEBHOOK_URL` | Optional für Workflow **04** |

In Docker Compose werden Variablen aus `.env` an den Container durchgereicht (siehe `docker-compose.yml`).

### Webhook-URLs

Nach Import in n8n: Produktions-URL der Instanz verwenden, z. B.:

- `POST …/webhook/hcm/candidate-apply` → Workflow **01**
- `POST …/webhook/hcm/candidate-decision` → Workflow **03**

---

## 3. Frontends (statisch)

Ordner `frontend/*` enthält reines HTML/JS.

1. `frontend/bewerbungsportal/config.js` anpassen (oder `config.example.js` nach `config.js` kopieren und ausfüllen).
2. Für **öffentliche** Clients nur den **`anon`** Key von Supabase verwenden — **nicht** den Service-Role-Key.

---

## 4. GitHub Actions (optional)

Workflows unter `.github/workflows/` erwarten `repository_dispatch` Events (Stubs). `GITHUB_TOKEN` im Repo reicht für einfache Callbacks; für echte PDF-Erzeugung später erweitern.
