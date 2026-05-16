import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  hr: "HR Workspace",
  candidates: "Bewerberdaten",
  process: "Process",
};

export function Breadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/hr" || path === "/hr/") return null;
  const parts = path.split("/").filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-6 pt-3 text-xs text-muted-foreground">
      <Link to="/hr" className="inline-flex items-center gap-1 hover:text-foreground">
        <Home className="h-3 w-3" /> Overview
      </Link>
      {parts.slice(1).map((p, i, rest) => {
        const isLast = i === rest.length - 1;
        const label = LABELS[p] ?? (p.length > 16 ? p.slice(0, 8) + "…" : p);
        return (
          <span key={i} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span className={isLast ? "text-foreground font-medium" : ""}>{label}</span>
          </span>
        );
      })}
    </nav>
  );
}
