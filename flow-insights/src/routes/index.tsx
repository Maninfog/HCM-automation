import { createFileRoute, Link } from "@tanstack/react-router";
import { Workflow, ArrowRight, UserPlus, ShieldCheck, Bot, UserCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "HCM Automation — Demo" },
      { name: "description", content: "Bewerber- oder HR-Bereich auswählen." },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">HCM Automation</div>
            <div className="text-[10px] text-muted-foreground">Onboarding & Payroll · Demo</div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Willkommen</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wähle deinen Einstieg.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/apply"
              className="group flex items-center gap-4 rounded-md border bg-card p-4 shadow-elevated transition hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-path-robot/10 text-path-robot">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Jetzt bewerben</div>
                <div className="text-xs text-muted-foreground">Bewerbermaske · öffentlich</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>

            <Link
              to="/login"
              className="group flex items-center gap-4 rounded-md border bg-card p-4 shadow-elevated transition hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Als HR anmelden</div>
                <div className="text-xs text-muted-foreground">Dashboard, Bewerberdaten, Prozesse</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3 text-path-robot" /> Robot-Pfad</span>
            <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3 text-path-human" /> Human-Pfad</span>
          </div>
        </div>
      </main>
    </div>
  );
}
