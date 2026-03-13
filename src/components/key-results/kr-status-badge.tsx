"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

// Mapping health status to semantic colors defined in globals.css
// Using bg-success, bg-warning, bg-destructive classes
const healthConfig: Record<HealthStatus, { label: string; className: string }> = {
  ON_TRACK: {
    label: "Em Dia",
    className: "bg-success text-success-foreground hover:bg-success/90 border-transparent",
  },
  AT_RISK: {
    label: "Em Risco",
    className: "bg-warning text-warning-foreground hover:bg-warning/90 border-transparent",
  },
  LATE: {
    label: "Atrasado",
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent",
  },
  NOT_STARTED: {
    label: "Não Iniciado",
    className: "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-success text-success-foreground hover:bg-success/90 border-transparent",
  },
};

interface KrStatusBadgeProps {
  health: HealthStatus;
  size?: "sm" | "default";
  className?: string;
}

export function KrStatusBadge({ health, size = "sm", className }: KrStatusBadgeProps) {
  if (health === "ON_TRACK") return null;

  const config = healthConfig[health];
  
  return (
    <Badge
      variant="outline" // Base style, overridden by className
      className={cn(
        config.className,
        size === "sm" ? "text-[10px] px-1.5 py-0 h-5" : "text-xs px-2 py-0.5",
        "font-medium whitespace-nowrap",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
