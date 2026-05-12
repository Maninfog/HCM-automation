# HCM Automation (n8n + Supabase)

Referenz-Implementierung zum Guide in `docs/n8n_HCM_Complete_Build_Guide.md` (lokal gespiegelt).

**Supabase-SQL:** Im Dashboard immer den **Datei-Inhalt** einfügen — oder einmal **`supabase/install_all.sql`** (nur neues Projekt). Details: `supabase/RUN_IN_ORDER.md` und `docs/SETUP.md`.

## Schnellstart

1. **Supabase:** SQL laut `docs/SETUP.md` ausführen.  
2. **n8n:** `docker compose up`, Workflows aus `n8n-workflows/` importieren, Env-Variablen setzen.  
3. **Frontend:** `frontend/bewerbungsportal/config.example.js` → `config.js` ausfüllen, statisch hosten.

## Ordner

| Pfad | Inhalt |
|------|--------|
| `supabase/migrations/` | Schema + RPC |
| `supabase/seed/` | Demo-Daten + optional Payroll-Demo |
| `n8n-workflows/` | 4 importierbare Workflows |
| `frontend/` | Bewerbungsportal, HR-Dashboard, Employee-Portal (MVP) |
| `.github/workflows/` | Stubs für `repository_dispatch` |
| `docs/` | SETUP, API, WORKFLOWS + Original-Guide |

## Hinweise

- Steuer-/SV-Logik in `calculate_payroll` ist **nur Demo**, keine Rechtsberatung.  
- `SUPABASE_SERVICE_KEY` **niemals** in öffentliche Web-Clients packen — nur n8n oder Server.

## GitHub

Eigenes Repo in diesem Ordner — Verbindung mit GitHub: **`docs/GITHUB.md`**.
