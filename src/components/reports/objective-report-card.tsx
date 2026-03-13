"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KrReportRow } from "./kr-report-row";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface KrReportData extends Doc<"keyResults"> {
    health: HealthStatus;
    phasing: Doc<"phasing">[];
    progressEntries: Array<{ value: number; recordedAt: number }>;
    milestones: Doc<"milestones">[];
    commentCount: number;
    decisionCount: number;
    decisions: Array<{ text: string; markedAt?: number }>;
    responsibleNames: string[];
}

interface ObjectiveReportData extends Doc<"objectives"> {
    keyResults: KrReportData[];
    krHealthCounts: Record<HealthStatus, number>;
    krCount: number;
}

interface ObjectiveReportCardProps {
    objective: ObjectiveReportData;
    cycleStartDate?: string;
    cycleEndDate?: string;
}

const statusLabels: Record<string, string> = {
    NOT_STARTED: "Não Iniciado",
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluído",
    AT_RISK: "Em Risco",
    LATE: "Atrasado",
};

const statusColors: Record<string, { badge: string; bar: string }> = {
    COMPLETED: {
        badge: "bg-success/15 text-success border-success/30",
        bar: "bg-success",
    },
    AT_RISK: {
        badge: "bg-warning/15 text-warning-foreground border-warning/30",
        bar: "bg-warning",
    },
    LATE: {
        badge: "bg-destructive/15 text-destructive border-destructive/30",
        bar: "bg-destructive",
    },
    IN_PROGRESS: {
        badge: "bg-primary/15 text-primary border-primary/30",
        bar: "bg-primary",
    },
    NOT_STARTED: {
        badge: "bg-muted text-muted-foreground border-border",
        bar: "bg-muted-foreground/30",
    },
};

const healthBarColors: Record<HealthStatus, string> = {
    ON_TRACK: "bg-success",
    COMPLETED: "bg-success",
    AT_RISK: "bg-warning",
    LATE: "bg-destructive",
    NOT_STARTED: "bg-muted-foreground/30",
};

export function ObjectiveReportCard({
    objective,
    cycleStartDate,
    cycleEndDate,
}: ObjectiveReportCardProps) {
    const statusConfig = statusColors[objective.status] ?? statusColors.NOT_STARTED;
    const krCount = objective.krCount;

    // Collect decisions from all KRs (highlights)
    const highlights = objective.keyResults
        .flatMap((kr) =>
            kr.decisions.map((d) => ({
                text: d.text,
                krTitle: kr.title,
            }))
        )
        .slice(0, 5); // max 5 highlights

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <CardHeader className="pb-4">
                {/* Title + status row */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                        <h3 className="text-lg font-bold text-foreground">{objective.title}</h3>
                        <Badge
                            variant="outline"
                            className={cn("border-transparent text-xs font-semibold", statusConfig.badge)}
                        >
                            {statusLabels[objective.status] ?? objective.status}
                        </Badge>
                    </div>
                    <span className="text-2xl font-bold text-foreground tabular-nums shrink-0">
                        {objective.progress}%
                    </span>
                </div>

                {/* Description */}
                {objective.description && (
                    <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
                )}

                {/* Main progress bar */}
                <div className="h-2.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div
                        className={cn("h-full rounded-full transition-all duration-700 ease-out", statusConfig.bar)}
                        style={{ width: `${Math.min(objective.progress, 100)}%` }}
                    />
                </div>

                {/* Health distribution bar */}
                {krCount > 0 && (
                    <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Distribuição de saúde ({krCount} KR{krCount > 1 ? "s" : ""})
                        </span>
                        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            {(["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]).map((status) => {
                                const count = objective.krHealthCounts[status];
                                if (count === 0) return null;
                                const pct = (count / krCount) * 100;
                                return (
                                    <div
                                        key={status}
                                        className={cn("h-full transition-all duration-500", healthBarColors[status])}
                                        style={{ width: `${pct}%` }}
                                        title={`${count} ${status === "ON_TRACK" ? "Em Dia" : status === "AT_RISK" ? "Em Risco" : status === "LATE" ? "Atrasado" : status === "COMPLETED" ? "Concluído" : "Não Iniciado"}`}
                                    />
                                );
                            })}
                        </div>
                        {/* Mini legend */}
                        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                            {(["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]).map((status) => {
                                const count = objective.krHealthCounts[status];
                                if (count === 0) return null;
                                const labels: Record<HealthStatus, string> = {
                                    ON_TRACK: "Em Dia",
                                    COMPLETED: "Concluído",
                                    AT_RISK: "Em Risco",
                                    LATE: "Atrasado",
                                    NOT_STARTED: "Não Iniciado",
                                };
                                return (
                                    <span key={status} className="flex items-center gap-1">
                                        <span className={cn("w-2 h-2 rounded-full", healthBarColors[status])} />
                                        {count} {labels[status]}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
                {/* KR rows */}
                {objective.keyResults.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic py-4 text-center">
                        Nenhum Key Result definido.
                    </div>
                ) : (
                    objective.keyResults.map((kr) => (
                        <KrReportRow
                            key={kr._id}
                            kr={kr}
                            cycleStartDate={cycleStartDate}
                            cycleEndDate={cycleEndDate}
                        />
                    ))
                )}

                {/* Highlights panel (decisions) */}
                {highlights.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-warning/5 border border-warning/20">
                        <h4 className="text-xs font-bold text-warning-foreground uppercase tracking-wider mb-2">
                            Highlights & Decisões
                        </h4>
                        <ul className="space-y-1.5">
                            {highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                                    <span className="text-warning mt-0.5 shrink-0">•</span>
                                    <span>
                                        <span className="text-muted-foreground">[{h.krTitle}]</span>{" "}
                                        {h.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
