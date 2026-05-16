import { CheckCircle2, Clock, Loader2, UserCheck, XCircle } from "lucide-react";
import type { ProcessStatus, CandidateStatus } from "@/types/hcm";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; tone: "success" | "warning" | "error" | "info" | "pending"; Icon: typeof Clock }> = {
  pending: { label: "Pending", tone: "pending", Icon: Clock },
  running: { label: "Running", tone: "info", Icon: Loader2 },
  waiting_approval: { label: "Waiting", tone: "warning", Icon: UserCheck },
  success: { label: "Success", tone: "success", Icon: CheckCircle2 },
  failed: { label: "Failed", tone: "error", Icon: XCircle },
  // candidate statuses
  new: { label: "New", tone: "info", Icon: Clock },
  scoring: { label: "Scoring", tone: "info", Icon: Loader2 },
  awaiting_review: { label: "Awaiting Review", tone: "warning", Icon: UserCheck },
  interview: { label: "Interview", tone: "info", Icon: UserCheck },
  hired: { label: "Hired", tone: "success", Icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "error", Icon: XCircle },
  onboarding: { label: "Onboarding", tone: "info", Icon: Loader2 },
};

const TONE_CLASS: Record<string, string> = {
  success: "bg-status-success-soft text-status-success",
  warning: "bg-status-warning-soft text-status-warning",
  error: "bg-status-error-soft text-status-error",
  info: "bg-status-info-soft text-status-info",
  pending: "bg-status-pending-soft text-status-pending",
};

export function StatusBadge({ status, className }: { status: ProcessStatus | CandidateStatus | string; className?: string }) {
  const entry = STATUS_MAP[status] ?? { label: status, tone: "pending" as const, Icon: Clock };
  const { label, tone, Icon } = entry;
  const spin = status === "running" || status === "scoring";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium", TONE_CLASS[tone], className)}>
      <Icon className={cn("h-3 w-3", spin && "animate-spin")} aria-hidden />
      {label}
    </span>
  );
}
