import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginHr } from "@/lib/hr-auth";
import { Workflow, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "HR Login — HCM Automation" },
      { name: "description", content: "Anmeldung für HR-Mitarbeitende." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("hr@demo.local");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    loginHr();
    navigate({ to: "/hr" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-md border bg-card p-6 shadow-elevated">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">HCM Automation</div>
            <div className="text-[11px] text-muted-foreground">HR Workspace</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold">Als HR anmelden</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Demo-Login · jede Eingabe wird akzeptiert.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pw">Passwort</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-xs text-status-error">{error}</p>}
          <Button type="submit" className="w-full">
            <ShieldCheck className="h-4 w-4" /> Anmelden
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          Kein HR? <Link to="/" className="text-primary hover:underline">Zurück zur Bewerbermaske</Link>
        </div>
      </div>
    </div>
  );
}
