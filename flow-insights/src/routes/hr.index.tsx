import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAllEvents, useCandidates } from "@/lib/api";
import { KpiCard } from "@/components/common/KpiCard";
import { PathBadge } from "@/components/common/PathBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PathLegend } from "@/components/process/ProcessTimeline";
import { Activity, AlertTriangle, Bot, UserCheck, PlayCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ENV } from "@/lib/env";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/")({
  component: OverviewPage,
  head: () => ({
    meta: [
      { title: "HR Overview — HCM Automation" },
      { name: "description", content: "Live-Übersicht über Onboarding-Prozesse: KPIs, letzte Events, Human/Robot-Verteilung." },
    ],
  }),
});

function OverviewPage() {
  const { data: candData } = useCandidates();
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollDone, setPayrollDone] = useState(false);

  async function handlePayrollRun() {
    const webhookUrl = (ENV as any).N8N_PAYROLL_WEBHOOK ?? "http://localhost:5678/webhook/hcm/step/ii-payroll-run";
    setPayrollLoading(true);
    setPayrollDone(false);
    try {
      const period = new Date().toISOString().slice(0, 7);
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, initiatedBy: "hr-dashboard" }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPayrollDone(true);
      toast.success("Payroll-Run gestartet", { description: `Periode ${period} wird verarbeitet. Du erhältst eine E-Mail.` });
      setTimeout(() => setPayrollDone(false), 5000);
    } catch (e: any) {
      toast.error("Payroll-Webhook nicht erreichbar", { description: "Stelle sicher dass n8n läuft (localhost:5678)." });
    } finally {
      setPayrollLoading(false);
    }
  }
  const { data: evData } = useAllEvents();

  const candidates = candData?.data ?? [];
  const events = evData?.data ?? [];

  const activeProcesses = new Set(
    candidates.filter((c) => !["hired", "rejected"].includes(c.status)).map((c) => c.id),
  ).size;
  const waiting = candidates.filter((c) => c.status === "awaiting_review").length;
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const robot24h = events.filter((e) => e.path_type === "robot" && +new Date(e.created_at) > dayAgo).length;
  const failed = events.filter((e) => e.status === "failed").length;

  const recent = [...events].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8);
  const humanShare = events.filter((e) => e.path_type === "human").length;
  const robotShare = events.filter((e) => e.path_type === "robot").length;
  const total = humanShare + robotShare || 1;
  const humanPct = Math.round((humanShare / total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">HR Overview</h1>
          <p className="text-sm text-muted-foreground">
            Onboarding-Pipeline · Human/Robot-Sichtbarkeit auf jeder Stufe
          </p>
        </div>
        <Button
          onClick={handlePayrollRun}
          disabled={payrollLoading}
          variant={payrollDone ? "outline" : "default"}
          className="gap-2"
        >
          {payrollDone
            ? <><CheckCircle2 className="h-4 w-4 text-green-500" /> Payroll gestartet</>
            : payrollLoading
              ? <><Bot className="h-4 w-4 animate-spin" /> Verarbeite …</>
              : <><PlayCircle className="h-4 w-4" /> Payroll-Run starten</>
          }
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Processes" value={activeProcesses} Icon={Activity} hint="In Bearbeitung" />
        <KpiCard label="Awaiting Human" value={waiting} Icon={UserCheck} tone="warning" hint="HR-Entscheidung offen" />
        <KpiCard label="Robot Steps (24h)" value={robot24h} Icon={Bot} tone="info" hint="Automatisierte Schritte" />
        <KpiCard label="Failed Steps" value={failed} Icon={AlertTriangle} tone={failed > 0 ? "error" : "default"} hint="Fehler letzte 7 Tage" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-md border bg-card p-4 shadow-elevated">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Process Events</h2>
            <PathLegend />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Path</th>
                  <th className="py-2 font-medium">Step</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Message</th>
                  <th className="py-2 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-muted">
                    <td className="py-2"><PathBadge path={e.path_type} /></td>
                    <td className="py-2"><code className="font-mono text-[11px] text-muted-foreground">{e.step_code}</code></td>
                    <td className="py-2"><StatusBadge status={e.status} /></td>
                    <td className="py-2 max-w-md truncate">
                      <Link to="/hr/process/$id" params={{ id: e.process_id }} className="hover:underline">
                        {e.message}
                      </Link>
                    </td>
                    <td className="py-2 text-right text-[11px] tabular-nums text-muted-foreground">
                      {new Date(e.created_at).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border bg-card p-4 shadow-elevated">
          <h2 className="text-base font-semibold">Human vs Robot</h2>
          <p className="text-xs text-muted-foreground">Anteil aller Events</p>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="h-24 w-24 rounded-full"
              style={{
                background: `conic-gradient(var(--path-human) 0 ${humanPct}%, var(--path-robot) ${humanPct}% 100%)`,
              }}
              aria-label={`Human ${humanPct}%, Robot ${100 - humanPct}%`}
            >
              <div className="m-2 flex h-20 w-20 items-center justify-center rounded-full bg-card text-sm font-semibold">
                {humanPct}% / {100 - humanPct}%
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-path-human" />
                <span>Human: <span className="font-mono">{humanShare}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-path-robot" />
                <span>Robot: <span className="font-mono">{robotShare}</span></span>
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-semibold">Pipeline Snapshot</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {(["awaiting_review", "interview", "hired", "rejected"] as const).map((s) => {
              const n = candidates.filter((c) => c.status === s).length;
              return (
                <li key={s} className="flex items-center justify-between">
                  <StatusBadge status={s} />
                  <span className="font-mono text-sm tabular-nums">{n}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
