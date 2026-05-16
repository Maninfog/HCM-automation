import { Search, Bell } from "lucide-react";
import { EnvStatusPill } from "./EnvStatusPill";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card px-4">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search candidates, processes, events …"
          className="h-9 w-full rounded border border-input bg-surface pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <EnvStatusPill />
        <button
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded hover:bg-accent"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2 rounded border bg-surface px-2 py-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            HR
          </div>
          <div className="text-xs leading-tight">
            <div className="font-medium">HR Manager</div>
            <div className="text-muted-foreground text-[10px]">People Operations</div>
          </div>
        </div>
      </div>
    </header>
  );
}
