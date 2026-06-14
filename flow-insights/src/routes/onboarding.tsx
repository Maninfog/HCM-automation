import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workflow, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingForm,
});

function OnboardingForm() {
  const { employee: employeeId } = Route.useSearch<{ employee?: string }>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    iban: "",
    bic: "",
    street: "",
    zip: "",
    city: "",
    tax_id: "",
    emergency_contact: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) { setError("Ungültiger Link — bitte kontaktiere HR."); return; }
    if (!form.iban || !form.street || !form.city) { setError("Bitte alle Pflichtfelder ausfüllen."); return; }
    setError("");
    setLoading(true);
    try {
      const sb = getSupabase();
      if (!sb) throw new Error("Supabase nicht konfiguriert.");
      const { error: err } = await sb
        .from("employees")
        .update({
          iban: form.iban,
          bic: form.bic,
          address: `${form.street}, ${form.zip} ${form.city}`,
          tax_id: form.tax_id,
          emergency_contact: form.emergency_contact,
          onboarding_complete: true,
        })
        .eq("id", employeeId);
      if (err) throw new Error(err.message);
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Fehler beim Speichern.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="max-w-sm w-full rounded-xl border bg-card p-8 text-center shadow-elevated">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Daten gespeichert!</h1>
          <p className="text-sm text-muted-foreground">
            Vielen Dank. Deine Daten wurden sicher an die Personalabteilung übermittelt. Du erhältst eine Bestätigung per E-Mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="max-w-lg w-full rounded-xl border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">HCM Automation</div>
            <div className="text-[11px] text-muted-foreground">Mitarbeiter Self-Service</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Willkommen im Team!</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bitte fülle deine persönlichen Daten aus, damit wir deine Gehaltsabrechnung einrichten können.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Bankverbindung *
            </legend>
            <div>
              <Label htmlFor="iban">IBAN *</Label>
              <Input id="iban" placeholder="DE00 0000 0000 0000 0000 00" value={form.iban} onChange={(e) => update("iban", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="bic">BIC</Label>
              <Input id="bic" placeholder="COBADEFFXXX" value={form.bic} onChange={(e) => update("bic", e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Privatadresse *
            </legend>
            <div>
              <Label htmlFor="street">Straße & Hausnummer *</Label>
              <Input id="street" placeholder="Musterstraße 1" value={form.street} onChange={(e) => update("street", e.target.value)} required />
            </div>
            <div className="flex gap-3">
              <div className="w-32 shrink-0">
                <Label htmlFor="zip">PLZ *</Label>
                <Input id="zip" placeholder="80331" value={form.zip} onChange={(e) => update("zip", e.target.value)} required />
              </div>
              <div className="flex-1">
                <Label htmlFor="city">Stadt *</Label>
                <Input id="city" placeholder="München" value={form.city} onChange={(e) => update("city", e.target.value)} required />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Weitere Informationen
            </legend>
            <div>
              <Label htmlFor="tax_id">Steuer-ID</Label>
              <Input id="tax_id" placeholder="12 345 678 901" value={form.tax_id} onChange={(e) => update("tax_id", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="emergency">Notfallkontakt (Name & Telefon)</Label>
              <Input id="emergency" placeholder="Max Mustermann, +49 123 456789" value={form.emergency_contact} onChange={(e) => update("emergency_contact", e.target.value)} />
            </div>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gespeichert …" : "Daten abschicken"}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">
            Deine Daten werden SSL-verschlüsselt übertragen und ausschließlich für die Gehaltsabrechnung verwendet.
          </p>
        </form>
      </div>
    </div>
  );
}
