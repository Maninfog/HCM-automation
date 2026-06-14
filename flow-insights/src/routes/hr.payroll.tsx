import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PlayCircle, Bot, CheckCircle2, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/payroll")({
  component: PayrollPage,
});

function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data } = await sb
        .from("employees")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 15_000,
  });
}

function usePayrollRuns() {
  return useQuery({
    queryKey: ["payroll_runs"],
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) return [];
      const { data } = await sb
        .from("payroll_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    refetchInterval: 10_000,
  });
}

function PayrollPage() {
  const { data: employees = [] } = useEmployees();
  const { data: payrollRuns = [], refetch: refetchRuns } = usePayrollRuns();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePayrollRun() {
    setLoading(true);
    setDone(false);
    try {
      const period = new Date().toISOString().slice(0, 7);
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch("http://localhost:5678/webhook/hcm/step/ii-payroll-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, initiatedBy: "hr-dashboard" }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      toast.success("Payroll-Run gestartet", {
        description: `Periode ${period} wird verarbeitet. Du erhältst eine Bestätigungs-Mail.`,
      });
      setTimeout(() => { setDone(false); refetchRuns(); }, 4000);
    } catch {
      toast.error("n8n nicht erreichbar", {
        description: "Stelle sicher dass n8n läuft (localhost:5678) und Workflow II-04 aktiv ist.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Payroll</h1>
          <p className="text-sm text-muted-foreground">
            Gehaltsabrechnung · Mitarbeiterübersicht · Abrechnungshistorie
          </p>
        </div>
        <Button onClick={handlePayrollRun} disabled={loading} className="gap-2">
          {done
            ? <><CheckCircle2 className="h-4 w-4 text-green-400" /> Gestartet</>
            : loading
              ? <><Bot className="h-4 w-4 animate-spin" /> Verarbeite …</>
              : <><PlayCircle className="h-4 w-4" /> Payroll-Run starten</>}
        </Button>
      </div>

      {/* Mitarbeiter */}
      <section className="rounded-md border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Aktive Mitarbeiter ({employees.length})</h2>
        </div>
        {employees.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Keine aktiven Mitarbeiter gefunden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Personalnr.</th>
                <th className="px-4 py-2 font-medium">E-Mail</th>
                <th className="px-4 py-2 font-medium">Eintritt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((e: any) => (
                <tr key={e.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-2 font-medium">{e.first_name} {e.last_name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.personnel_number}</td>
                  <td className="px-4 py-2 text-muted-foreground">{e.email}</td>
                  <td className="px-4 py-2 text-muted-foreground">{e.start_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Abrechnungshistorie */}
      <section className="rounded-md border bg-card shadow-elevated">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Abrechnungshistorie</h2>
        </div>
        {payrollRuns.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Noch keine Abrechnungen vorhanden. Starte einen Payroll-Run.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Zeitraum</th>
                <th className="px-4 py-2 font-medium">Brutto</th>
                <th className="px-4 py-2 font-medium">Netto</th>
                <th className="px-4 py-2 font-medium">Zahlung</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payrollRuns.map((r: any) => (
                <tr key={r.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-2 font-mono text-xs">{r.period_start} – {r.period_end}</td>
                  <td className="px-4 py-2">{Number(r.gross_salary).toFixed(2)} €</td>
                  <td className="px-4 py-2 font-semibold text-green-600">{Number(r.net_salary).toFixed(2)} €</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.payment_date}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
