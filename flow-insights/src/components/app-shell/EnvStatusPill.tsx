import { useAllEvents } from "@/lib/api";
import { hasSupabase, hasApplyWebhook, hasDecisionWebhook } from "@/lib/env";
import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export function EnvStatusPill() {
  const { data } = useAllEvents();
  const source = data?.source ?? "mock";
  const live = source === "live";
  const webhooks = (hasApplyWebhook ? 1 : 0) + (hasDecisionWebhook ? 1 : 0);
  return (
    <div className="hidden lg:flex items-center gap-3 rounded border bg-surface px-2.5 py-1 text-[11px]">
      <span className="inline-flex items-center gap-1.5">
        <CircleDot className={cn("h-3 w-3", live ? "text-status-success" : "text-status-warning")} />
        <span className="font-medium">{live ? "Supabase live" : hasSupabase ? "Supabase fallback" : "Mock data"}</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">
        n8n: <span className="font-mono font-medium text-foreground">{webhooks}/2</span> webhooks
      </span>
    </div>
  );
}
