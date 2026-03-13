"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import { Target, KeyRound, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
} from "recharts";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface FranchiseSummaryCardProps {
    franchiseId: string;
    name: string;
    cycleId: string;
    objectiveCount: number;
    krCount: number;
    avgProgress: number;
    healthCounts: Record<HealthStatus, number>;
    predominantHealth: string;
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

export function FranchiseSummaryCard({
    franchiseId,
    name,
    cycleId,
    objectiveCount,
    krCount,
    avgProgress,
    healthCounts,
    predominantHealth,
}: FranchiseSummaryCardProps) {
    const colors = useChartColors();
    const gaugeData = [{ value: avgProgress, fill: colors.primary }];

    return (
        <Link href={`/relatorios/${franchiseId}?ciclo=${cycleId}`}>
            <Card
                className={cn(
                    "hover:shadow-lg transition-all duration-300 cursor-pointer group h-full border-t-4 overflow-hidden",
                    healthBorderColors[predominantHealth] ?? "border-t-border"
                )}
            >
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Radial gauge */}
                        <div className="w-20 h-20 shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    startAngle={90}
                                    endAngle={-270}
                                    data={gaugeData}
                                    barSize={8}
                                >
                                    <RadialBar
                                        dataKey="value"
                                        background={{ fill: colors.muted }}
                                        cornerRadius={4}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-foreground tabular-nums">
                                    {avgProgress}%
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate text-base">
                                    {name}
                                </h3>
                                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>

                            {/* Counters */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Target className="h-3.5 w-3.5" />
                                    {objectiveCount} objetivo{objectiveCount !== 1 ? "s" : ""}
                                </span>
                                <span className="flex items-center gap-1">
                                    <KeyRound className="h-3.5 w-3.5" />
                                    {krCount} KR{krCount !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Health distribution bar */}
                            {krCount > 0 && (
                                <div className="space-y-1">
                                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                        {(["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]).map(
                                            (status) => {
                                                const count = healthCounts[status];
                                                if (count === 0) return null;
                                                const pct = (count / krCount) * 100;
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
                                                const count = healthCounts[status];
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
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
