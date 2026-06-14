import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApplyMutation, usePositions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PathBadge } from "@/components/common/PathBadge";
import { ArrowRight, CheckCircle2, Workflow } from "lucide-react";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
  head: () => ({
    meta: [
      { title: "Bewerben — HCM Automation" },
      { name: "description", content: "Bewerbung einreichen — Intake & Scoring laufen automatisiert." },
    ],
  }),
});

function ApplyPage() {
  const { data: posData } = usePositions();
  const positions = posData?.data ?? [];
  const m = useApplyMutation();
  const [form, setForm] = useState({ full_name: "", email: "", position_id: "", cv_url: "", cover_letter: "" });
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    m.mutate(form, { onSuccess: () => setSubmitted(true) });
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">HCM Automation</div>
            <div className="text-[10px] text-muted-foreground">Karriereportal</div>
          </div>
          <div className="ml-auto">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
              Als HR anmelden →
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-md border bg-card p-6 shadow-elevated">
            <h1 className="text-2xl font-semibold">Jetzt bewerben</h1>
            <p className="mt-1 text-sm text-muted-foreground">Deine Bewerbung wird sofort an unsere Automation übergeben.</p>

            {submitted ? (
              <div className="mt-6 rounded-md border border-status-success/30 bg-status-success-soft p-4">
                <div className="flex items-center gap-2 text-status-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Bewerbung erhalten</span>
                </div>
                <p className="mt-1 text-sm">
                  Robot-Intake läuft — du wirst per Mail kontaktiert sobald HR entschieden hat.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => { setSubmitted(false); setForm({ full_name: "", email: "", position_id: "", cv_url: "", cover_letter: "" }); }}>
                  Neue Bewerbung
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Vollständiger Name</Label>
                    <Input id="name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Position</Label>
                  <Select required value={form.position_id} onValueChange={(v) => setForm({ ...form, position_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Position wählen" /></SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{(p as any).position_title ?? p.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cv">CV Link (optional)</Label>
                  <Input id="cv" placeholder="https://…" value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cover">Anschreiben (optional)</Label>
                  <Textarea id="cover" rows={4} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} />
                </div>
                <Button type="submit" disabled={m.isPending || !form.position_id}>
                  {m.isPending ? "Wird übermittelt …" : "Bewerbung absenden"}
                </Button>
              </form>
            )}
          </section>

          <aside className="rounded-md border bg-card p-5 shadow-elevated h-fit sticky top-20">
            <h2 className="text-sm font-semibold">Was passiert als Nächstes?</h2>
            <ol className="mt-4 space-y-3">
              {[
                { path: "robot" as const, label: "Intake & Validierung" },
                { path: "robot" as const, label: "CV-Parsing & Match-Score" },
                { path: "human" as const, label: "HR Review (Interview / Hire / Reject)" },
                { path: "robot" as const, label: "Mail + Account-Provisioning" },
              ].map((step, i, arr) => (
                <li key={i}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><PathBadge path={step.path} /></div>
                    <div className="flex-1 text-sm">{step.label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="ml-6 mt-1 mb-1 flex h-4 items-center">
                      <ArrowRight className="h-3 w-3 rotate-90 text-muted-foreground" />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  );
}
