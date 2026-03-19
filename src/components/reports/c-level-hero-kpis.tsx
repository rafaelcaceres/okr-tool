"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import { AlertTriangle, Target, KeyRound } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface CLevelHeroKPIsProps {
  globalProgress: number;
  globalTotalKRs: number;
  globalTotalObjectives: number;
  globalHealth: Record<HealthStatus, number>;
}

const healthLabels: Record<HealthStatus, string> = {
  ON_TRACK: "Em Dia",
  AT_RISK: "Em Risco",
  LATE: "Atrasado",
  COMPLETED: "Concluído",
  NOT_STARTED: "N. Iniciado",
};

const healthDotClasses: Record<HealthStatus, string> = {
  ON_TRACK: "bg-success",
  COMPLETED: "bg-success",
  AT_RISK: "bg-warning",
  LATE: "bg-destructive",
  NOT_STARTED: "bg-muted-foreground/40",
};

export function CLevelHeroKPIs({
  globalProgress,
  globalTotalKRs,
  globalTotalObjectives,
  globalHealth,
}: CLevelHeroKPIsProps) {
  const colors = useChartColors();

  const gaugeData = [{ value: globalProgress, fill: colors.primary }];

  const onTrackCount = globalHealth.ON_TRACK + globalHealth.COMPLETED;
  const alertCount = globalHealth.AT_RISK + globalHealth.LATE;

  const healthFills: Record<HealthStatus, string> = {
    ON_TRACK: colors.success,
    COMPLETED: colors.success,
    AT_RISK: colors.warning,
    LATE: colors.destructive,
    NOT_STARTED: colors.mutedForeground,
  };

  const donutData = (
    ["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]
  )
    .filter((s) => globalHealth[s] > 0)
    .map((status) => ({
      name: healthLabels[status],
      value: globalHealth[status],
      fill: healthFills[status],
      status,
    }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* KPI 1: Progress Gauge */}
      <Card className="shadow-sm bg-linear-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Progresso Global
          </span>
          <div className="w-36 h-36 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={gaugeData}
                barSize={16}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  background={{ fill: colors.muted }}
                  cornerRadius={8}
                  angleAxisId={0}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-foreground tabular-nums leading-none">
                {globalProgress}
              </span>
              <span className="text-lg font-semibold text-muted-foreground -mt-0.5">%</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider -mt-1">
            concluído
          </span>
        </CardContent>
      </Card>

      {/* KPI 2: Total KRs & Objectives */}
      <Card className="shadow-sm">
        <CardContent className="p-5 flex flex-col items-center justify-center h-full">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Key Results
          </span>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="h-5 w-5 text-primary" />
            <span className="text-4xl font-bold text-foreground tabular-nums">
              {globalTotalKRs}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            {globalTotalObjectives} objetivo{globalTotalObjectives !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Health Donut */}
      <Card className="shadow-sm">
        <CardContent className="p-5 flex flex-col items-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Em Dia / Concluídos
          </span>
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-success tabular-nums">
                {onTrackCount}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
            {donutData.map((d) => (
              <span key={d.status} className="flex items-center gap-0.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", healthDotClasses[d.status])} />
                {d.value} {d.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Alert Count */}
      <Card className={cn(
        "shadow-sm",
        alertCount > 0 && "border-destructive/30"
      )}>
        <CardContent className="p-5 flex flex-col items-center justify-center h-full">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Atenção Necessária
          </span>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn(
              "h-5 w-5",
              alertCount > 0 ? "text-destructive" : "text-muted-foreground/40"
            )} />
            <span className={cn(
              "text-4xl font-bold tabular-nums",
              alertCount > 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {alertCount}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            KR{alertCount !== 1 ? "s" : ""} em risco ou atrasado{alertCount !== 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
