"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Target, KeyRound, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";
type TrendDirection = "UP" | "DOWN" | "STABLE";

interface FranchiseCLevelSummary {
  _id: string;
  name: string;
  objectiveCount: number;
  krCount: number;
  avgProgress: number;
  healthCounts: Record<HealthStatus, number>;
  predominantHealth: string;
  progressDelta: number;
  trend: TrendDirection;
}

interface CLevelFranchiseGridProps {
  franchises: FranchiseCLevelSummary[];
  cycleId: string;
}

const healthBorderColors: Record<string, string> = {
  ON_TRACK: "border-t-success",
  AT_RISK: "border-t-warning",
  LATE: "border-t-destructive",
  COMPLETED: "border-t-success",
  NOT_STARTED: "border-t-border",
};

const healthBarColors: Record<HealthStatus, string> = {
  ON_TRACK: "bg-success",
  COMPLETED: "bg-success",
  AT_RISK: "bg-warning",
  LATE: "bg-destructive",
  NOT_STARTED: "bg-muted-foreground/30",
};

const healthLabels: Record<HealthStatus, string> = {
  ON_TRACK: "Em Dia",
  AT_RISK: "Em Risco",
  LATE: "Atrasado",
  COMPLETED: "Concluído",
  NOT_STARTED: "N. Iniciado",
};

const trendConfig = {
  UP: { icon: TrendingUp, colorClass: "text-success", prefix: "+" },
  DOWN: { icon: TrendingDown, colorClass: "text-destructive", prefix: "" },
  STABLE: { icon: Minus, colorClass: "text-muted-foreground", prefix: "" },
} as const;

export function CLevelFranchiseGrid({ franchises, cycleId }: CLevelFranchiseGridProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Ranking de Franquias
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {franchises.map((franchise, index) => {
          const trend = trendConfig[franchise.trend];
          const TrendIcon = trend.icon;

          return (
            <Link
              key={franchise._id}
              href={`/relatorios/${franchise._id}?ciclo=${cycleId}`}
            >
              <Card
                className={cn(
                  "hover:shadow-lg transition-all duration-300 cursor-pointer group h-full border-t-4 overflow-hidden",
                  healthBorderColors[franchise.predominantHealth] ?? "border-t-border"
                )}
              >
                <CardContent className="p-5">
                  {/* Rank + Name + Arrow */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground/60 tabular-nums shrink-0">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-base">
                        {franchise.name}
                      </h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Progress + Trend */}
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
                      {franchise.avgProgress}%
                    </span>
                    {franchise.trend !== "STABLE" && (
                      <div className={cn("flex items-center gap-0.5 pb-0.5", trend.colorClass)}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold tabular-nums">
                          {trend.prefix}{franchise.progressDelta}pp
                        </span>
                      </div>
                    )}
                    {franchise.trend === "STABLE" && (
                      <div className="flex items-center gap-0.5 pb-0.5 text-muted-foreground">
                        <Minus className="h-3.5 w-3.5" />
                        <span className="text-xs">estável</span>
                      </div>
                    )}
                  </div>

                  {/* Counters */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {franchise.objectiveCount} objetivo{franchise.objectiveCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5" />
                      {franchise.krCount} KR{franchise.krCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Health distribution bar */}
                  {franchise.krCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                        {(["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]).map(
                          (status) => {
                            const count = franchise.healthCounts[status];
                            if (count === 0) return null;
                            const pct = (count / franchise.krCount) * 100;
                            return (
                              <div
                                key={status}
                                className={cn("h-full transition-all", healthBarColors[status])}
                                style={{ width: `${pct}%` }}
                              />
                            );
                          }
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-muted-foreground">
                        {(["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]).map(
                          (status) => {
                            const count = franchise.healthCounts[status];
                            if (count === 0) return null;
                            return (
                              <span key={status} className="flex items-center gap-0.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full", healthBarColors[status])} />
                                {count} {healthLabels[status]}
                              </span>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
