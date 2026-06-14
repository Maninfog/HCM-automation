import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, Workflow, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutHr } from "@/lib/hr-auth";

const nav = [
  { to: "/hr", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/hr/candidates", label: "Bewerberdaten", icon: Users },
  { to: "/hr/payroll", label: "Payroll", icon: Wallet },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  function handleLogout() {
    logoutHr();
    navigate({ to: "/" });
  }
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
          <Workflow className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">HCM Automation</div>
          <div className="text-[10px] text-muted-foreground">Onboarding & Payroll</div>
        </div>
      </div>
      <nav className="flex-1 p-2">
        <div className="caption px-2 py-2">Workspace</div>
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path === n.to || path.startsWith(n.to + "/");
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
        >
          <LogOut className="h-4 w-4" /> Abmelden
        </button>
        <div className="px-2 pt-2 text-[11px] text-muted-foreground">v1.0 · Demo build</div>
      </div>
    </aside>
  );
}
