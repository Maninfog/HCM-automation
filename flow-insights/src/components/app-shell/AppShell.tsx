import { useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Breadcrumbs } from "./Breadcrumbs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isHrArea = path.startsWith("/hr");

  if (!isHrArea) {
    // Public surfaces (/, /login, 404) render their own layout.
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <Breadcrumbs />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
