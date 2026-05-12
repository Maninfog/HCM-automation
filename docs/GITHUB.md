# Mit GitHub verbinden

Dieser Ordner ist ein **eigenes Git-Repository** (`main` mit Initial-Commit), unabhängig vom übergeordneten Cursor-Workspace.

## 1. Leeres Repo auf GitHub anlegen

Auf github.com: **New repository** → z. B. `hcm-automation` → **ohne** README/License (lokal haben wir schon Inhalt).

## 2. Remote setzen und pushen

Im Terminal (Pfade anpassen):

```bash
cd "/Users/maxi/Downloads/ClaudeCursorWorkspace copy/02-projects/hcm-automation"
git remote add origin https://github.com/DEIN_USER/hcm-automation.git
git push -u origin main
```

SSH statt HTTPS:

```bash
git remote add origin git@github.com:DEIN_USER/hcm-automation.git
git push -u origin main
```

## 3. GitHub CLI (optional)

```bash
cd "/Users/maxi/Downloads/ClaudeCursorWorkspace copy/02-projects/hcm-automation"
gh repo create hcm-automation --private --source=. --remote=origin --push
```

## Hinweis zum übergeordneten Repo

Der Workspace `ClaudeCursorWorkspace copy` kann `hcm-automation/` als normalen Ordner sehen. Wenn du dort **kein** verschachteltes Repo willst, `hcm-automation` aus dem Parent-Repo aus `.gitignore` ausschließen oder das Projekt physisch nach `~/repos/hcm-automation` verschieben.
