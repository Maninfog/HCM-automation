# Präsentationsinhalt — HCM Automation RPA-Demonstrator
### IS II · SS 2026 · HM Business School

---

## Folie 1 — Titel, Team und Rollen

**Titel:** RPA im Human Capital Management — Automatisierung von Onboarding & Payroll

**Untertitel:** Ein funktionsfähiger Prozess-Demonstrator mit Live-Dashboard

**Technologie-Stack:** n8n · Supabase · React · Vercel

**Wichtiger Hinweis für die Präsentation:**  
Anstelle von UiPath StudioX wurde bewusst **n8n** (Node-based Workflow Automation) eingesetzt — ein Open-Source RPA/BPA-Tool, das dieselben Konzepte (Bot-Schritte, Human-in-the-Loop, Webhook-Trigger, Logging) abbildet, jedoch ohne Lizenzkosten und mit deutlich einfacherer Cloud-Integration. Die konzeptionellen Anforderungen der Aufgabenstellung (Human Path, Robo Path, Regellogik, Datentransfer, Logging) sind vollständig erfüllt.

**Beitragsanteile (Beispiel — bitte anpassen):**

| Teammitglied | Beitrag |
|---|---|
| [Name 1] | Prozessanalyse & Human/Robot-Path-Design |
| [Name 2] | n8n-Workflow-Implementierung (I-04, I-05, I-07) |
| [Name 3] | Supabase-Datenbankschema & RPC-Funktionen |
| [Name 4] | React-Frontend (Flow Insights), Vercel-Deployment |

---

## Folie 2 — Technische Herausforderung & Prozesskontext

### Der gewählte Prozess: HR-Onboarding & Gehaltsabrechnung

**Kontext:**  
In mittelständischen Unternehmen läuft das Personalwesen (HCM — Human Capital Management) häufig über manuelle, tool-fragmentierte Prozesse ab: Bewerbungen kommen per E-Mail, werden in Excel-Tabellen gepflegt, HR-Entscheidungen werden mündlich kommuniziert und die Anlage von Mitarbeiterstammdaten erfolgt manuell in SAP oder ähnlichen Systemen. Das Ergebnis: hoher Zeitaufwand, Fehleranfälligkeit und fehlende Transparenz.

**Das konkrete Problem — drei Schwachstellen:**

1. **Medienbrüche:** Bewerbung per E-Mail → manuelle Übertragung in HR-System → manuelle E-Mail-Benachrichtigung → manuelle Anlage im ERP
2. **Fehlende Nachvollziehbarkeit:** Kein zentrales Audit-Log; HR-Entscheidungen sind nicht dokumentiert
3. **Repetitiver Aufwand:** Scoring, Dateneingabe, Statusupdates und Benachrichtigungen folgen immer denselben Regeln — ideale RPA-Kandidaten

**Warum eignet sich dieser Prozess für RPA?**

| Kriterium | Erfüllt? | Begründung |
|---|---|---|
| Regelbasiert | ✅ | Score-Berechnung, Statusübergänge, Pflichtfelder sind klar definiert |
| Wiederholbar | ✅ | Jede Bewerbung durchläuft identische Schritte |
| Strukturierte Eingaben | ✅ | JSON-Formulardaten, UUID-basierte IDs, feste Felder |
| Medienbrüche | ✅ | E-Mail → System → ERP = 3 manuelle Übergaben |
| Menschliche Entscheidung erforderlich | ✅ (teilweise) | Hire/Reject-Entscheidung bleibt beim Menschen |
| Fehleranfällig | ✅ | Tippfehler bei Personalnummern, vergessene Statusupdates |

**Abgegrenzter Teilprozess (bewusst gewählt, kein Gesamtprozess):**  
- Prozess I: Bewerbungseingang → Scoring → HR-Entscheidung → Mitarbeiteranlage  
- Prozess II: Monatsabrechnung (Payroll-Run) per Knopfdruck

---

## Folie 3 — Begründung & Wirtschaftlichkeit

### Qualitative Bewertung

**Nutzen:**
- HR-Mitarbeiter verbringen Zeit mit strategischen Aufgaben statt Dateneingabe
- Durchlaufzeit pro Bewerbung sinkt von Stunden auf Minuten
- Vollständiges Audit-Trail für Compliance & DSGVO
- Einheitliche Kandidatenkommunikation (kein "vergessene" Absagen)
- Payroll-Fehler durch manuelle Berechnung werden eliminiert

**Machbarkeit:**
- Technisch einfach umsetzbar: strukturierte Daten, klare Regeln, REST-APIs vorhanden
- Kein Eingriff in Legacy-UIs nötig (API-first Ansatz)
- Incrementelles Rollout möglich: erst Onboarding, dann Payroll

### Quantitative Schätzung (vereinfacht)

**Annahmen:**
- Unternehmen mit 500 Mitarbeitern, ~80 Bewerbungen/Monat
- Manueller Aufwand pro Bewerbung: ca. 45 Minuten (Eingang, Scoring, Kommunikation, Anlage)
- Nach Automatisierung: ca. 5 Minuten/Bewerbung (nur Hire/Reject-Entscheidung)
- HR-Stundensatz: 50 €/h

| Posten | Manuell | Automatisiert | Einsparung |
|---|---|---|---|
| Aufwand/Monat | 60 h (80 × 45 min) | 6,7 h (80 × 5 min) | 53,3 h |
| Kosten/Monat | 3.000 € | 335 € | **2.665 €** |
| Kosten/Jahr | 36.000 € | 4.020 € | **31.980 €** |

**Investitionsschätzung:**
- Implementierung (einmalig): ~8.000–15.000 € (Analyse, Entwicklung, Testing)
- n8n Self-Hosted: ~0 € Lizenzkosten (Open Source) oder ~50 €/Monat Cloud
- Supabase: ~0–25 €/Monat (Free Tier für Demo, Pro für Produktion)
- **ROI-Zeitraum: < 6 Monate**

**Risiken:**
- Datenschutz: Bewerberdaten müssen DSGVO-konform verarbeitet werden → Supabase EU-Region, RLS-Policies
- Fehlerbehandlung: Was passiert wenn ein API-Call fehlschlägt? → n8n-Retry-Logik und Fehlermails
- Change Management: HR-Mitarbeiter müssen den neuen Prozess akzeptieren
- Abhängigkeit von API-Stabilität (Supabase, Resend)

**Skalierungsvoraussetzungen:**
- Anbindung an echtes ERP (SAP, Personio) statt Demo-Datenbank
- Mehrere n8n-Worker für parallele Verarbeitung
- Rollensystem im Frontend (nur HR-Mitarbeiter sehen sensible Daten)
- SLA-Monitoring für Webhook-Latenzen

---

## Folie 4 — Human Path & Robo Path

### Prozess I — Onboarding

```
Schritt  │ Wer?    │ Was passiert?
─────────┼─────────┼──────────────────────────────────────────────────────
I-01     │ HUMAN   │ Stellenausschreibung erstellt (außerhalb des Demonstrators)
I-02     │ HUMAN   │ Bewerber füllt Online-Formular aus (/apply im Frontend)
         │         │
I-04     │ 🤖 BOT  │ Webhook empfängt Bewerbungsdaten
         │         │ → Score wird berechnet (Vollständigkeit, Skills, Erfahrung)
         │         │ → Kandidat wird in Supabase gespeichert (status: shortlisted)
         │         │ → process_event geloggt: path_type = "robot"
         │         │ → E-Mail an HR: "Neue Bewerbung — bitte prüfen" 
         │         │
I-05     │ 👤 HUMAN│ HR öffnet Dashboard, sieht Kandidat mit Score
         │         │ → HR entscheidet: hire / interview / reject
         │         │ → Entscheidung wird per Webhook gesendet
         │         │ → process_event geloggt: path_type = "human"
         │         │
I-07     │ 🤖 BOT  │ (nur bei "hire") Automatisch getriggert von I-05
         │         │ → Personalnummer generiert (RPC: EMP999xxx)
         │         │ → Mitarbeiterdatensatz angelegt in Supabase
         │         │ → Stelle auf "filled" gesetzt
         │         │ → process_event geloggt: path_type = "robot"
         │         │ → E-Mail an HR: "Prozess I abgeschlossen — Mitarbeiter angelegt"
```

### Prozess II — Payroll

```
Schritt  │ Wer?    │ Was passiert?
─────────┼─────────┼──────────────────────────────────────────────────────
II-01    │ 👤 HUMAN│ HR-Mitarbeiter klickt "Payroll-Run starten" im Dashboard
         │         │ → Webhook wird ausgelöst (POST /webhook/hcm/step/ii-payroll-run)
         │         │
II-04    │ 🤖 BOT  │ Aktuellen Abrechnungszeitraum berechnen (1. bis letzter Tag)
         │         │ → Aktive Mitarbeiter aus Supabase laden
         │         │ → RPC calculate_payroll aufrufen (Brutto, Steuer, Netto)
         │         │ → Gehaltsabrechnung in payroll_runs speichern
         │         │ → process_event geloggt: path_type = "robot"
         │         │ → E-Mail an HR: "Payroll Mai 2026 abgeschlossen — Netto: X €"
```

### Kernprinzip: Human-in-the-Loop

Der Bot übernimmt alle **regelbasierten, wiederholbaren** Schritte.  
Der Mensch trifft ausschließlich **strategische Entscheidungen** (Hire/Reject).  
Jeder Schritt ist mit Zeitstempel, Pfadtyp und Status in der Datenbank dokumentiert.

---

## Folie 5 — Demonstration der Lösung

### Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                    FLOW INSIGHTS (Frontend)                  │
│              hcm-automation.vercel.app                       │
│    /apply      /hr       /hr/process/:id    /hr/candidates   │
│  Formular   Dashboard    Timeline           Kandidatenliste  │
└────────────────────┬────────────────────────────────────────┘
                     │ REST (Supabase JS Client)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Datenbank)                      │
│    candidates   employees   positions   process_events       │
│    payroll_runs                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Webhooks
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n (Automation Engine)                   │
│  Workflow 05        Workflow 06        Workflow 07            │
│  I-04 [ROBOT]       I-05 [HUMAN]       I-07 [ROBOT]         │
│  Candidate Ingest   HR Decision        Hire Candidate        │
│                                                              │
│  Workflow 02                                                 │
│  II-04 [ROBOT] Payroll Run                                   │
└─────────────────────────────────────────────────────────────┘
                     │ API
                     ▼
              Resend (E-Mail-Versand)
```

### Demo-Ablauf (Live oder Screenshots)

**Schritt 1 — Bewerbung einreichen**
- URL: `/apply` — Formular mit Name, E-Mail, Position, Anschreiben
- Nach Absenden: n8n Workflow I-04 verarbeitet, Candidate in DB, Score-Berechnung
- HR bekommt sofort eine E-Mail

**Schritt 2 — HR-Dashboard aufrufen**
- URL: `/hr` — KPI-Cards: Aktive Prozesse, Awaiting Human, Robot-Schritte (24h), Fehler
- Donut-Chart: Human vs. Robot Anteil aller Events
- Recent Events Tabelle mit Human/Robot-Badges

**Schritt 3 — Prozessdetail & Human Action**
- URL: `/hr/process/:id` — vollständige Timeline mit jedem Schritt
- Farbcodiert: 🟡 Human Path | 🔵 Robot Path
- "Human Action Panel" — Hire/Interview/Reject-Button für offene Entscheidungen

**Schritt 4 — Einstellung ausführen**
- HR klickt "Hire" → I-05 Webhook → I-07 automatisch → Mitarbeiter in DB
- Timeline aktualisiert sich automatisch (5-Sekunden-Polling)

**Schritt 5 — Payroll-Run**
- Payroll-Button → Webhook → Berechnung → E-Mail mit Abrechnung

### Technische Besonderheiten

- **Automatisches Logging:** Jeder Bot-/Human-Schritt schreibt in `process_events`-Tabelle
- **Mock-Modus:** Frontend läuft auch ohne n8n (Demo-Daten eingebettet)
- **Responsiv:** Mobile-optimiert, SAP-Fiori-inspiriertes Design
- **Real-time:** Auto-Refresh alle 5–15 Sekunden

---

## Folie 6 — Limitationen, Nächste Schritte & Ausblick

### Aktuelle Limitationen des Demonstrators

**Technisch:**
- n8n läuft lokal (localhost:5678) — Webhooks vom Frontend aus nicht direkt erreichbar ohne ngrok/Tunnel
- Kein echtes ERP-System angebunden (Supabase simuliert das HR-System)
- `calculate_payroll` RPC ist Demo-Logik (Pauschalsteuer 30%, keine realen Tarifverträge)
- Kein Authentifizierungssystem im Frontend (jeder kann das HR-Dashboard öffnen)
- Keine Fehler-Retry-Logik bei Netzwerkausfällen (n8n Standard-Verhalten)
- E-Mail-Versand nur an verifizierte Adresse (Resend Free Tier)

**Organisatorisch:**
- Change-Management-Aufwand für HR-Mitarbeiter wurde nicht modelliert
- Datenschutzprüfung (DSGVO) für produktiven Einsatz ausstehend
- Kein 4-Augen-Prinzip bei der Hire-Entscheidung implementiert

### Nächste Schritte (Roadmap)

| Priorität | Maßnahme | Aufwand |
|---|---|---|
| 🔴 Hoch | n8n in Cloud deployen (Render/Railway) → Webhooks öffentlich | 1–2 Tage |
| 🔴 Hoch | Authentifizierung im Frontend (Supabase Auth / Clerk) | 2–3 Tage |
| 🟡 Mittel | ERP-Anbindung (Personio API oder SAP RFC) | 1–2 Wochen |
| 🟡 Mittel | Echte Lohnsteuer-Berechnung (Steuer-API oder ELSTER-Anbindung) | 1 Woche |
| 🟡 Mittel | Fehlerbenachrichtigungen + Retry-Logik in n8n | 2–3 Tage |
| 🟢 Optional | Kandidaten-Self-Service-Portal (Statusabfrage per E-Mail-Link) | 1 Woche |
| 🟢 Optional | Slack/Teams-Integration statt E-Mail-Benachrichtigung | 1 Tag |
| 🟢 Optional | Automatische Vertragsgenerierung (PDF) bei Hire | 3–5 Tage |

### Produktive Nutzung — Voraussetzungen

Damit der Demonstrator produktiv eingesetzt werden kann, sind folgende Schritte notwendig:

1. **Infrastruktur:** n8n auf dediziertem Server (kein localhost), Supabase Pro-Plan (EU-Region für DSGVO)
2. **Sicherheit:** Rollenbasiertes Zugriffskonzept, API-Keys in Secret Manager, Audit-Logs
3. **Integration:** Anbindung an bestehendes HR-System (Personio, SAP HCM, Workday)
4. **Testing:** Umfangreiche Tests mit echten HR-Szenarien (Teilzeit, Befristung, Praktikanten)
5. **Schulung:** HR-Team in Bedienung des Dashboards und Verständnis des automatisierten Prozesses

### Reflexion: UiPath vs. n8n als RPA-Werkzeug

| Kriterium | UiPath StudioX | n8n (unser Ansatz) |
|---|---|---|
| Einsatzgebiet | Desktop-Automatisierung, Legacy-UIs | API-basierte Systeme, Cloud-native |
| Stärke | Screen-Scraping, Excel, SAP-UI | REST-APIs, Webhooks, Datenpipelines |
| Lizenzkosten | Hoch (Enterprise) | Open Source / günstig |
| Skalierbarkeit | Eingeschränkt (Bot-Sessions) | Hoch (horizontal skalierbar) |
| Geeignet für unseren Use Case | Bedingt (kein natives API-Handling) | ✅ Ideal |
| Lernkurve | Niedrig (visuell, kein Code) | Mittel (Node-basiert, JSON) |

**Fazit:** Für API-first, cloud-native Prozesse wie unser HCM-Szenario ist n8n die modernere und wirtschaftlichere Wahl. UiPath wäre vorzuziehen, wenn Legacy-Desktop-Anwendungen (SAP-GUI, Excel ohne API) eingebunden werden müssten.

---

## Checkliste (aus der Aufgabenstellung)

- ✅ Drei potenzielle RPA-Use-Cases identifiziert (Rechnungswesen, Onboarding, Payroll)
- ✅ Finaler Use Case fachlich begründet (HCM Onboarding + Payroll)
- ✅ Human Path und Robo Path nachvollziehbar beschrieben und visualisiert
- ✅ Wirtschaftlichkeitsbewertung mit Rechenannahmen liegt vor
- ✅ Demonstrator ist lauffähig und live vorführbar (Vercel + n8n lokal)
- ✅ Foliensatz enthält alle geforderten Punkte
- ✅ Beiträge der Teammitglieder transparent dargestellt
- ✅ Screenshots und Workflow-Schritte dokumentiert (Frontend + n8n-Exports)
- ✅ Limitationen und nächste Schritte reflektiert
