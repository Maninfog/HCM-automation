
# HCM Automation Demo — Plan

Enterprise-Look (SAP/Fiori-inspiriert, moderner), zentraler UX-Fokus: jeder Prozessschritt zeigt eindeutig **HUMAN** oder **ROBOT**. Stack: TanStack Start + Tailwind + shadcn/ui (statt Next.js, da Lovable-Projektbasis).

## 1. Design-Tokens (`src/styles.css`)

Enterprise-Blau-Palette in oklch, ruhige Neutrals, dedizierte Status-Tokens.

- `--primary`: Enterprise Blue (~ #0A6ED1 Fiori-Referenz, in oklch)
- `--surface`, `--surface-muted`: kühle Grautöne für Datenflächen/Toolbars
- Status-Tokens: `--status-success`, `--status-warning`, `--status-error`, `--status-info`, `--status-pending` (+ je `-foreground` / `-soft` Variante für Badges)
- Path-Tokens: `--path-human` (Indigo/Blue), `--path-robot` (Teal/Cyan) — verwendet von Badge, Timeline-Connector, Avatar-Ring
- Radius: 6px (Cards), 4px (Inputs) — präzise, nicht verspielt
- Shadow: 2 Stufen (`--shadow-sm` flach, `--shadow-md` für Popover) — sehr subtil
- Typo: Inter (UI) + JetBrains Mono (IDs/Codes); H1 28/600, H2 20/600, Body 14/400, Caption 12/500 uppercase tracking
- Spacing-Skala auf 4er-Grid, dichte Tabellen-Row-Height 40px

Dark-Mode-Werte parallel gepflegt.

## 2. Layout & Navigation

`src/routes/__root.tsx` rendert `AppShell`:

- **Top App Bar** (56px): Logo „HCM Automation", globale Suche (placeholder), Env-Status-Pill (Supabase/n8n live oder Mock), Theme-Toggle, User-Avatar
- **Left Nav** (collapsible, 240/64px) — shadcn `Sidebar`:
  - Overview (`/`)
  - Apply (`/apply`)
  - HR Dashboard (`/hr`)
  - Processes (Gruppe, expandiert wenn `/hr/process/$id` aktiv)
- **Content**: max-w-screen-2xl, 24px padding, Breadcrumbs unter App Bar

Responsive: ab `md` Sidebar permanent, mobil als Sheet.

## 3. Routen

```
src/routes/
  __root.tsx                 AppShell + QueryClientProvider + Toaster
  index.tsx                  Executive Overview
  apply.tsx                  Bewerbungsportal (Form → apply-webhook)
  hr.tsx                     Layout mit <Outlet/> + Kandidaten-Master
  hr.index.tsx               Default rechts: Empty-State „Wähle Kandidat"
  hr.process.$id.tsx         Prozessdetail mit Timeline
```

### `/` — Executive Overview
- 4 KPI-Kacheln: Active Processes, Awaiting Human Decision, Robot Steps (24h), Failed Steps
- Mini-Donut „HUMAN vs ROBOT share" (letzte 7 Tage)
- Section „Recent Process Events" — kompakte Tabelle (max 10), klickbar → `/hr/process/$id`
- Section „Pipeline Snapshot" — Kandidaten pro Status

### `/apply` — Bewerbungsportal
- Zweispaltig: links Form (Name, Email, Position-Select aus `positions`, CV-Link, Cover-Letter), rechts „Was passiert als Nächstes?" — Mini-Flow-Diagramm: ROBOT Intake → ROBOT Scoring → HUMAN Review → …
- Submit → `VITE_N8N_APPLY_WEBHOOK` (POST JSON). Erfolg: shadcn Toast + Inline-Success-Card. Fehler: zeige Fallback („Mock-Modus") und legt Mock-Event lokal an.

### `/hr` — HR Dashboard
- **Toolbar**: Suche, Filter (Status, Position, path_type, Datumsbereich), „Export CSV" (no-op), „Reload"
- **Master-Tabelle**: Name, Email, Position, Score (Progress-Bar), Status-Badge, Last Step (mit path-Badge), Updated. Sortierbar, Pagination 25/Seite.
- Row-Klick → navigiert zu `/hr/process/$id` (Detail-Panel als rechte Spalte auf ≥xl als Split, sonst Vollseite)

### `/hr/process/$id` — Prozessdetail
- Header: Kandidat-Card (Name, Email, Position, Score, aktueller Status)
- **Human Action Panel** (sticky oben rechts) — sichtbar wenn `status = waiting_approval`:
  - 3 große Buttons: **Interview** (info), **Hire** (success), **Reject** (destructive, mit Confirm-Dialog)
  - Optionales Notiz-Textarea
  - Disabled-State + Spinner während Mutation; nach Erfolg invalidiert Query, fügt optimistisches Event ein
- **Process Timeline** (Hauptbereich):
  - Vertikale Timeline mit zwei-spurigem Connector (Human-Spur links, Robot-Spur rechts) — Übergänge ROBOT→HUMAN→ROBOT visuell als verbindende Kurve mit Farbverlauf
  - Jedes Event-Item: Path-Badge (HUMAN/ROBOT mit Icon `User`/`Bot`), Status-Pill, step_code (Mono), Message, Zeitstempel, Payload-Collapsible
  - Spezial-Renderer für `step_code = "email_sent"`: Mail-Icon + Empfänger aus Payload
  - Auto-Refresh (React Query `refetchInterval: 5000`) wenn offener Prozess
- Filter über Timeline: nur HUMAN / nur ROBOT / alle

## 4. Shared Components (`src/components/`)

```
app-shell/         AppShell, TopBar, AppSidebar, Breadcrumbs, EnvStatusPill
common/            PathBadge, StatusBadge, KpiCard, EmptyState, DataTable, Toolbar
process/           ProcessTimeline, TimelineEvent, HumanActionPanel, ProcessHeader, PathLegend
candidate/         CandidateTable, CandidateRow, CandidateFilters, CandidateMiniCard
apply/             ApplyForm, NextStepsFlow
ui/                shadcn primitives (vorhanden)
```

`PathBadge` und `StatusBadge` sind die zentralen Erkennungs-Marker — nur an einer Stelle definiert, überall importiert. Klar lesbar mit Icon + Text, nicht nur Farbe (Accessibility).

## 5. Daten-Layer

`src/lib/`:
- `env.ts` — liest `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_N8N_APPLY_WEBHOOK`, `VITE_N8N_DECISION_WEBHOOK`. Exportiert `isBackendConfigured` + `isBackendReachable` (async ping).
- `supabase.ts` — lazy Supabase-Browser-Client (nur wenn URL+Key vorhanden). Wenn nicht: `null`.
- `mock-data.ts` — realistische Seeds für candidates/positions/process_events inkl. einem vollständigen ROBOT → HUMAN → ROBOT-Flow (Intake → Scoring → Awaiting Review → Hired → Welcome-Mail gesendet → Account erstellt).
- `api/` — Query-Hooks (`useCandidates`, `useCandidate`, `useProcessEvents`, `useKpis`): versuchen Supabase, fangen Fehler ab, fallen auf Mock zurück. Status `source: 'live' | 'mock'` wird in EnvStatusPill angezeigt.
- `webhooks.ts` — `triggerApply(payload)`, `triggerDecision({candidateId, decision, note})`. POST `application/json`. Timeout 8s. Bei Fehler: lokales Mock-Event injizieren + Toast „Webhook unreachable — running in mock mode".
- Mutations via TanStack Query mit Invalidation der `['process-events', id]`- und `['candidates']`-Keys.

Types in `src/types/hcm.ts` (Candidate, Position, ProcessEvent, PathType, ProcessStatus).

## 6. Realtime / Refresh

- Optional Supabase-Realtime-Subscription auf `process_events` (wenn live), sonst Polling 5s nur auf Detail-Seite mit offenem Prozess.
- Toast-Notification bei neuen Events am offenen Detail.

## 7. Accessibility & Polish

- Alle Path-/Status-Marker mit Icon + Label (nicht farb-only)
- Fokus-Ringe via `--ring`, sichtbar auf allen interaktiven Elementen
- ARIA: Timeline als `<ol>` mit `aria-label="Process timeline"`, Buttons mit beschreibendem Label, Tabelle mit `<caption>` (sr-only)
- Animationen: `tw-animate-css` für Slide-in der Timeline-Items, dezente Hover-Lift auf Cards (transform/shadow), keine bouncy springs
- Skeleton-States für alle Listen/Detail
- Empty-States mit Illustration-Glyph + Erklärungstext

## 8. README

`README.md` mit:
- Setup (`bun install`, `bun dev`)
- Env-Variablen-Liste + Beispiel `.env.local`
- Hinweis: ohne Env läuft die App im Mock-Modus
- Deploy: in Lovable via Publish-Button (Cloudflare Workers); für Vercel-Export Hinweis auf TanStack Start Vercel-Adapter
- Daten-Schema-Übersicht der erwarteten Supabase-Tabellen

---

## Technische Details (für Devs)

- **Routing**: TanStack Start File-Routes mit Layout-Route `hr.tsx` (Outlet).
- **Data Fetching**: TanStack Query, `defaultPreloadStaleTime: 0` (bereits im Router). Loader nur für Cache-Priming, Components nutzen `useQuery` (kein `useSuspenseQuery` wegen Mock-Fallback-Pfad).
- **Forms**: react-hook-form + zod (bereits installiert).
- **Tabellen**: eigene leichte `DataTable`-Komponente auf shadcn `Table` (keine TanStack Table nötig für diesen Scope).
- **State**: ausschließlich React Query — kein Zustand-Store nötig (UI-State bleibt lokal).
- **Webhooks**: direkter `fetch` aus Browser. Wenn n8n CORS blockt, README erklärt n8n-Webhook-Node CORS-Setting.
- **Keine Supabase-Tabellen anlegen** — User nutzt externes Supabase, Schema wird als read-only erwartet.
- **Index-Placeholder** wird entfernt.

## Out of Scope (bewusst)

- Auth (Demo-UI, keine Login-Seite)
- Tatsächliche CSV-Export-Logik (Button als Stub)
- i18n (DE-Strings hardcoded in Komponenten — kann später extrahiert werden)
- Payroll-Detailseite (nur als KPI/Menü-Eintrag „Coming soon", da Hauptfokus Onboarding-Flow ist)
