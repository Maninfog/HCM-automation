import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCandidates } from "@/lib/api";
import { processIdForCandidate } from "@/lib/api";
import { PathBadge } from "@/components/common/PathBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { CandidateStatus } from "@/types/hcm";

export const Route = createFileRoute("/hr/candidates")({
  component: CandidatesPage,
  head: () => ({
    meta: [
      { title: "Bewerberdaten — HCM Automation" },
      { name: "description", content: "Kandidatenliste mit Filtern und Prozessstatus." },
    ],
  }),
});

function CandidatesPage() {
  const { data, isLoading } = useCandidates();
  const candidates = data?.data ?? [];
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [path, setPath] = useState<string>("all");

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (q && !`${c.full_name} ${c.email} ${c.position_title ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (status !== "all" && c.status !== status) return false;
      if (path !== "all" && c.last_path !== path) return false;
      return true;
    });
  }, [candidates, q, status, path]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bewerberdaten</h1>
          <p className="text-sm text-muted-foreground">Kandidaten & Prozessstatus · klicke einen Kandidaten für die Timeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["candidates"] })}>
            <RefreshCw className="h-4 w-4" /> Reload
          </Button>
          <Button variant="outline" size="sm" disabled><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-elevated">
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche Name, Email, Position" className="h-9 w-72 pl-8" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              {(["new", "scoring", "awaiting_review", "interview", "hired", "rejected"] as CandidateStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={path} onValueChange={setPath}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Last path" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Pfade</SelectItem>
              <SelectItem value="human">Nur Human</SelectItem>
              <SelectItem value="robot">Nur Robot</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} von {candidates.length} Kandidaten
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface-muted text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 font-medium">Kandidat</th>
                <th className="px-4 py-2 font-medium">Position</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Last Step</th>
                <th className="px-4 py-2 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">Lade …</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">Keine Kandidaten gefunden.</td></tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate({ to: "/hr/process/$id", params: { id: processIdForCandidate(c.id) } })}
                  className="cursor-pointer hover:bg-surface-muted"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-sm">{c.position_title ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${c.score}%` }} />
                      </div>
                      <span className="font-mono text-xs tabular-nums">{c.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {c.last_path && <PathBadge path={c.last_path} />}
                      <code className="font-mono text-[11px] text-muted-foreground">{c.last_step}</code>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[11px] tabular-nums text-muted-foreground">
                    {new Date(c.updated_at).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
