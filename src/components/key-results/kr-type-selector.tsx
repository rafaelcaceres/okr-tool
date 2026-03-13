"use client";

import { cn } from "@/lib/utils";
import { KR_TYPES, type KrType, getKrTypeLabel, getKrTypeDescription } from "@/lib/kr-types";
import {
  TrendingUp,
  Percent,
  GitBranch,
  Gauge,
  ClipboardCheck,
  Shield,
} from "lucide-react";

const KR_TYPE_META: Record<
  KrType,
  { icon: React.ComponentType<{ className?: string }>; example: string }
> = {
  CUMULATIVE_NUMERIC: {
    icon: TrendingUp,
    example: "Receita, volume, clientes",
  },
  PROGRESSIVE_PERCENTAGE: {
    icon: Percent,
    example: "Adoção, cobertura, taxa",
  },
  STAGE_GATE: {
    icon: GitBranch,
    example: "Milestones sequenciais",
  },
  PERIODIC_INDEX: {
    icon: Gauge,
    example: "NPS, engajamento, survey",
  },
  CHECKLIST_COMPLIANCE: {
    icon: ClipboardCheck,
    example: "Auditoria, readiness",
  },
  MULTI_PHASE_WITH_RISK: {
    icon: Shield,
    example: "Roadmap regulatório",
  },
};

interface KrTypeSelectorProps {
  value: KrType;
  onChange: (type: KrType) => void;
}

export function KrTypeSelector({ value, onChange }: KrTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">
        Tipo de KR
      </label>
      <div className="grid grid-cols-2 gap-2">
        {KR_TYPES.map((type) => {
          const meta = KR_TYPE_META[type];
          const Icon = meta.icon;
          const selected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    selected && "text-primary"
                  )}
                >
                  {getKrTypeLabel(type)}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {meta.example}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {getKrTypeDescription(value)}
      </p>
    </div>
  );
}
