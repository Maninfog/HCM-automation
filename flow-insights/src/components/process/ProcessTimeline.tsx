import { Bot, Mail, User } from "lucide-react";
import { PathBadge } from "@/components/common/PathBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ProcessEvent } from "@/types/hcm";
import { cn } from "@/lib/utils";
import { useState } from "react";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

function EventCard({ ev }: { ev: ProcessEvent }) {
  const [open, setOpen] = useState(false);
  const isHuman = ev.path_type === "human";
  const isMail = ev.step_code === "email_sent" || ev.step_code.endsWith("_email_sent");
  const Icon = isMail ? Mail : isHuman ? User : Bot;
  return (
    <div className={cn(
      "rounded-md border bg-card p-4 shadow-elevated transition-colors",
      isHuman ? "border-l-2 border-l-path-human" : "border-l-2 border-l-path-robot",
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isHuman ? "bg-path-human-soft text-path-human" : "bg-path-robot-soft text-path-robot",
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PathBadge path={ev.path_type} />
            <StatusBadge status={ev.status} />
            <code className="font-mono text-[11px] text-muted-foreground">{ev.step_code}</code>
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">{formatTime(ev.created_at)}</span>
          </div>
          <p className="mt-1.5 text-sm">{ev.message}</p>
          {ev.payload && Object.keys(ev.payload).length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setOpen((o) => !o)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                {open ? "Hide payload" : "Show payload"}
              </button>
              {open && (
                <pre className="mt-1.5 max-h-40 overflow-auto rounded bg-surface-muted p-2 text-[11px] font-mono">
                  {JSON.stringify(ev.payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProcessTimeline({ events, filter }: { events: ProcessEvent[]; filter?: "all" | "human" | "robot" }) {
  const filtered = filter && filter !== "all" ? events.filter((e) => e.path_type === filter) : events;
  if (filtered.length === 0) {
    return <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">Keine Events.</div>;
  }
  return (
    <ol aria-label="Process timeline" className="relative space-y-3">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" aria-hidden />
      {filtered.map((ev) => (
        <li key={ev.id} className="relative pl-10 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className={cn(
            "absolute left-2.5 top-5 h-3 w-3 rounded-full ring-4 ring-surface",
            ev.path_type === "human" ? "bg-path-human" : "bg-path-robot",
          )} />
          <EventCard ev={ev} />
        </li>
      ))}
    </ol>
  );
}

export function PathLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-path-human" />
        <span>Human path</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-path-robot" />
        <span>Robot path</span>
      </div>
    </div>
  );
}
