import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
  tone?: "default" | "warning" | "success" | "error" | "info";
  className?: string;
}

const TONE: Record<string, string> = {
  default: "text-foreground",
  warning: "text-status-warning",
  success: "text-status-success",
  error: "text-status-error",
  info: "text-status-info",
};

export function KpiCard({ label, value, hint, Icon, tone = "default", className }: Props) {
  return (
    <div className={cn("rounded-md border bg-card p-4 shadow-elevated", className)}>
      <div className="flex items-start justify-between">
        <div className="caption">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tabular-nums", TONE[tone])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
