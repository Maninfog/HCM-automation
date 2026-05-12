# Supabase SQL — so ausführen

## Einmal alles (neues / leeres Projekt)

1. Im Ordner `supabase/` die Datei **`install_all.sql`** öffnen.
2. **Alles kopieren** → Supabase **SQL** → **New query** → einfügen → **Run**.

Enthalten: `001` Schema + `002` Funktionen/RPC + `test_data` + optionaler Demo-Mitarbeiter für Payroll.

> Wenn Tabellen **schon existieren**, kommt z. B. `relation "organizational_units" already exists` — dann **kein** zweites Mal `install_all.sql`, sondern nur fehlende Einzel-Skripte oder neues Supabase-Projekt.

## Oder Schritt für Schritt

Im **Supabase Dashboard → SQL → New query** jeweils den **Datei-Inhalt** (nicht den Pfad) einfügen:

1. `migrations/001_initial_schema.sql` → Run  
2. `migrations/002_functions_and_rpc.sql` → Run  
3. `seed/test_data.sql` → Run  
4. optional `seed/demo_employee_for_payroll.sql` → Run  

**Falsch:** eine Zeile wie `supabase/migrations/001_initial_schema.sql` ausführen — das ist kein SQL.

**Richtig:** der **Inhalt** der `.sql`-Datei (beginnt mit `--` oder `CREATE …`).

### Trigger

`001` nutzt `EXECUTE FUNCTION` (PostgreSQL 14+, Supabase-Standard). Falls deine DB das ablehnt, in `001_initial_schema.sql` die vier Trigger-Zeilen auf `EXECUTE PROCEDURE` stellen.
