import { Bot, User } from "lucide-react";
import type { PathType } from "@/types/hcm";
import { cn } from "@/lib/utils";

interface Props {
  path: PathType;
  size?: "sm" | "md";
  className?: string;
}

export function PathBadge({ path, size = "sm", className }: Props) {
  const isHuman = path === "human";
  const Icon = isHuman ? User : Bot;
  const label = isHuman ? "HUMAN" : "ROBOT";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-mono font-semibold tracking-wider",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        isHuman
          ? "bg-path-human-soft text-path-human"
          : "bg-path-robot-soft text-path-robot",
        className,
      )}
      aria-label={`${label} path`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </span>
  );
}
