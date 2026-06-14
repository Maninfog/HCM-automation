import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCandidates, useProcessEvents } from "@/lib/api";
import { ProcessTimeline, PathLegend } from "@/components/process/ProcessTimeline";
import { HumanActionPanel } from "@/components/process/HumanActionPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/hr/process/$id")({
  component: ProcessDetail,
  head: () => ({
    meta: [
      { title: "Prozessdetail — HCM Automation" },
      { name: "description", content: "Komplette Event-Timeline für einen Onboarding-Prozess." },
    ],
  }),
});

function ProcessDetail() {
  const { id } = Route.useParams();
  const candidateId = id.startsWith("proc-") ? id.slice("proc-".length) : id;
  const { data: candData } = useCandidates();
  const candidate = candData?.data.find((c) => c.id === candidateId);
  // Events are stored with the plain candidate UUID as process_id (no "proc-" prefix)
  const { data: evData, isLoading } = useProcessEvents(candidateId);
  const events = evData?.data ?? [];
  const [filter, setFilter] = useState<"all" | "human" | "robot">("all");

  const decided = candidate && ["hired", "rejected", "interview"].includes(candidate.status);
  const waitingHuman = candidate && ["applied", "shortlisted", "scoring"].includes(candidate.status);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4 min-w-0">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/hr"><ArrowLeft className="h-4 w-4" /> Zurück</Link>
          </Button>
        </div>

        <section className="rounded-md border bg-card p-5 shadow-elevated">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="caption">Process · <code className="font-mono">{id}</code></div>
              <h1 className="mt-1 text-xl font-semibold">{candidate?.full_name ?? "Unbekannter Kandidat"}</h1>
              <p className="text-sm text-muted-foreground">{candidate?.email}</p>
              <p className="text-sm text-muted-foreground">{candidate?.position_title}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {candidate && <StatusBadge status={candidate.status} />}
              {candidate && (
                <div className="text-xs text-muted-foreground">
                  Score: <span className="font-mono font-medium text-foreground">{candidate.score}</span>
                </div>
              )}
            </div>
          </div>

          {candidate && (() => {
            const appData = (candidate as any).application_data ?? {};
            const cv = appData.cv ?? appData.experience ?? null;
            const coverLetter = appData.coverLetter ?? appData.cover_letter ?? null;
            const skills: string[] = appData.skills ?? appData.certifications ?? [];
            const education = appData.education ?? null;
            if (!cv && !coverLetter && !skills.length && !education) return null;
            return (
              <div className="mt-4 border-t pt-4 grid gap-3 sm:grid-cols-2 text-sm">
                {cv && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Erfahrung / CV</div>
                    <p className="text-foreground">{cv}</p>
                  </div>
                )}
                {education && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ausbildung</div>
                    <p className="text-foreground">{education}</p>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((s) => (
                        <span key={s} className="rounded bg-surface px-2 py-0.5 text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {coverLetter && (
                  <div className="sm:col-span-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Anschreiben</div>
                    <p className="text-foreground italic">"{coverLetter}"</p>
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        <section className="rounded-md border bg-card p-4 shadow-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <h2 className="text-base font-semibold">Process Timeline</h2>
            <div className="flex items-center gap-3">
              <PathLegend />
              <div className="flex rounded border bg-surface p-0.5 text-xs">
                {(["all", "human", "robot"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={
                      "rounded px-2 py-1 transition-colors " +
                      (filter === f ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {f === "all" ? "Alle" : f === "human" ? "Human" : "Robot"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Lade Events …</div>
          ) : (
            <ProcessTimeline events={events} filter={filter} />
          )}
        </section>
      </div>

      <aside className="space-y-4">
        {waitingHuman && !decided ? (
          <HumanActionPanel candidateId={candidateId} />
        ) : (
          <section className="rounded-md border bg-card p-4 shadow-elevated">
            <h3 className="text-sm font-semibold">Human Action</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Aktuell ist keine menschliche Entscheidung erforderlich. Der Prozess läuft vollautomatisch weiter.
            </p>
          </section>
        )}

        <section className="rounded-md border bg-card p-4 shadow-elevated">
          <h3 className="text-sm font-semibold">Schritte (Übersicht)</h3>
          <ul className="mt-3 space-y-2 text-xs">
            {events.slice(-6).reverse().map((e) => (
              <li key={e.id} className="flex items-start gap-2">
                <div className={
                  "mt-1 h-2 w-2 shrink-0 rounded-full " +
                  (e.path_type === "human" ? "bg-path-human" : "bg-path-robot")
                } />
                <div className="flex-1">
                  <div className="font-medium">{e.message}</div>
                  <div className="text-muted-foreground">
                    {new Date(e.created_at).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {e.step_code === "email_sent" && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
