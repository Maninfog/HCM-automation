# GitHub Pages für die HCM-UI

Die statische Oberfläche liegt unter **`frontend/`** (Startseite: `frontend/index.html`).

## Option A — GitHub Actions (empfohlen)

1. Repo auf GitHub: **Settings → Pages → Build and deployment**
2. **Source:** **GitHub Actions** (nicht „Deploy from branch“).
3. Push auf `main` triggert den Workflow **Deploy GitHub Pages** (`.github/workflows/pages.yml`).
4. Nach dem ersten Lauf erscheint die URL z. B.  
   `https://maninfog.github.io/HCM-automation/`  
   (exakter Pfad steht unter **Actions** → Workflow-Run → *github-pages*.)

> Beim ersten Mal kann GitHub nach **Environment approval** für `github-pages` fragen — einmal erlauben.

## Option B — Nur `docs/` (ohne Actions)

GitHub erlaubt Pages nur aus **`/docs`** oder Repo-Root. Wenn du **ohne** Workflow arbeiten willst, den Inhalt von `frontend/` nach `docs/` kopieren und unter Pages **Branch main / folder docs** wählen.

## Konfiguration nach dem Deploy

1. **`bewerbungsportal/config.js`**: `supabaseUrl`, `supabaseAnonKey`, `n8nWebhookApply` auf echte Werte setzen (Commit nur, wenn keine Secrets drinstehen — besser lokal bauen oder Secrets über injiziertes Script, für Kurse reicht Anon oft).
2. **CORS:** Supabase erlaubt unter **Authentication → URL configuration** deine GitHub-Pages-URL als **Additional Redirect URLs** / Site URL — für reine REST-`fetch` ggf. **API CORS** prüfen (Supabase Dashboard).

## Lokal „UI ansehen“

```bash
cd "02-projects/InfoSys2/RPA Prototyp/hcm-automation/frontend"
python3 -m http.server 8765
```

Dann Browser: `http://localhost:8765/` — Karten zur Bewerbung, HR, Employee.
