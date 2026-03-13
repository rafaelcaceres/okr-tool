"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type KrType, getKrTypeLabel } from "@/lib/kr-types";
import { CheckCircle2, AlertTriangle, XCircle, Minus, TrendingDown, Users, MessageCircle } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { format, parseISO, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface KrReportData extends Doc<"keyResults"> {
    health: HealthStatus;
    phasing: Doc<"phasing">[];
    progressEntries: Array<{ value: number; recordedAt: number }>;
    milestones: Doc<"milestones">[];
    commentCount: number;
    decisionCount: number;
    responsibleNames: string[];
}

interface KrReportRowProps {
    kr: KrReportData;
    cycleStartDate?: string;
    cycleEndDate?: string;
}

const measurementLabels: Record<string, string> = {
    NUMERIC: "Numérico",
    PERCENTUAL: "Percentual",
    FINANCIAL: "Financeiro",
    MILESTONE: "Marco",
};

const healthConfig: Record<HealthStatus, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    borderColor: string;
    bgColor: string;
    iconColor: string;
}> = {
    ON_TRACK: {
        label: "Em Dia",
        icon: CheckCircle2,
        borderColor: "border-l-success",
        bgColor: "bg-success/10",
        iconColor: "text-success",
    },
    AT_RISK: {
        label: "Em Risco",
        icon: AlertTriangle,
        borderColor: "border-l-warning",
        bgColor: "bg-warning/10",
        iconColor: "text-warning-foreground",
    },
    LATE: {
        label: "Atrasado",
        icon: XCircle,
        borderColor: "border-l-destructive",
        bgColor: "bg-destructive/10",
        iconColor: "text-destructive",
    },
    NOT_STARTED: {
        label: "Não Iniciado",
        icon: Minus,
        borderColor: "border-l-border",
        bgColor: "bg-muted/50",
        iconColor: "text-muted-foreground",
    },
    COMPLETED: {
        label: "Concluído",
        icon: CheckCircle2,
        borderColor: "border-l-success",
        bgColor: "bg-success/10",
        iconColor: "text-success",
    },
};

function formatValue(kr: Doc<"keyResults">, value: number): string {
    if (kr.measurementType === "FINANCIAL") {
        const symbol =
            kr.currency === "USD" ? "$" : kr.currency === "EUR" ? "€" : "R$";
        return `${symbol} ${value.toLocaleString("pt-BR")}`;
    }
    if (kr.measurementType === "PERCENTUAL") return `${value}%`;
    if (kr.measurementType === "MILESTONE") return `${value}`;
    return `${value} ${kr.unit ?? ""}`.trim();
}

function getProgressPercent(kr: Doc<"keyResults">): number {
    if (kr.measurementType === "MILESTONE") {
        return kr.targetValue === 0 ? 0 : Math.round((kr.currentValue / kr.targetValue) * 100);
    }
    const range = Math.abs(kr.targetValue - kr.initialValue);
    if (range === 0) return 0;
    let progress: number;
    if (kr.direction === "DECREASING") {
        progress = ((kr.initialValue - kr.currentValue) / (kr.initialValue - kr.targetValue)) * 100;
    } else {
        progress = ((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100;
    }
    return Math.round(Math.min(100, Math.max(0, progress)));
}

const progressBarColor: Record<HealthStatus, string> = {
    ON_TRACK: "bg-success",
    AT_RISK: "bg-warning",
    LATE: "bg-destructive",
    NOT_STARTED: "bg-muted-foreground/30",
    COMPLETED: "bg-success",
};

export function KrReportRow({ kr, cycleStartDate, cycleEndDate }: KrReportRowProps) {
    const config = healthConfig[kr.health];
    const Icon = config.icon;
    const progress = getProgressPercent(kr);
    const isNonMilestone = kr.measurementType !== "MILESTONE";
    const hasPhasing = kr.phasing.length > 0;

    return (
        <div
            className={cn(
                "rounded-lg border border-l-4 transition-all",
                config.borderColor,
                "bg-card hover:shadow-sm"
            )}
        >
            <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: KR info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Title row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-foreground">{kr.title}</h4>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                {kr.krType ? getKrTypeLabel(kr.krType as KrType) : (measurementLabels[kr.measurementType ?? "NUMERIC"])}
                            </Badge>
                            {kr.direction === "DECREASING" && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1 font-normal">
                                    <TrendingDown className="h-3 w-3" /> Decrescente
                                </Badge>
                            )}
                        </div>

                        {/* Description */}
                        {kr.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{kr.description}</p>
                        )}

                        {/* Values row */}
                        <div className="flex items-center gap-6 text-xs">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Inicial</span>
                                <span className="font-medium text-muted-foreground">{formatValue(kr, kr.initialValue)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Atual</span>
                                <span className="font-bold text-foreground">{formatValue(kr, kr.currentValue)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">Meta</span>
                                <span className="font-medium text-muted-foreground">{formatValue(kr, kr.targetValue)}</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500", progressBarColor[kr.health])}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground">{progress}%</span>
                                {/* Responsibles */}
                                {kr.responsibleNames.length > 0 && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        {kr.responsibleNames.join(", ")}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Milestones for MILESTONE type */}
                        {kr.measurementType === "MILESTONE" && kr.milestones.length > 0 && (
                            <div className="space-y-1 pt-1">
                                {kr.milestones.map((m) => (
                                    <div key={m._id} className="flex items-center gap-2 text-xs">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full border flex items-center justify-center shrink-0",
                                            m.completed
                                                ? "border-success bg-success/20"
                                                : "border-muted-foreground/30"
                                        )}>
                                            {m.completed && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
                                        </div>
                                        <span className={cn(
                                            "text-xs",
                                            m.completed ? "text-muted-foreground line-through" : "text-foreground"
                                        )}>
                                            {m.description}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Status + mini chart */}
                    <div className="flex items-start gap-4 shrink-0">
                        {/* Mini chart */}
                        {isNonMilestone && hasPhasing && (
                            <div className="w-[140px] h-[60px] shrink-0">
                                <MiniPhasingChart kr={kr} cycleStartDate={cycleStartDate} />
                            </div>
                        )}

                        {/* Farol (traffic light) */}
                        <div className={cn(
                            "flex flex-col items-center justify-center rounded-lg w-14 h-14 shrink-0",
                            config.bgColor
                        )}>
                            <Icon className={cn("h-6 w-6", config.iconColor)} />
                            <span className={cn("text-[9px] font-semibold mt-0.5", config.iconColor)}>
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom row: blockers / comments */}
                {(kr.decisionCount > 0 || kr.commentCount > 0) && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                        {kr.commentCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <MessageCircle className="h-3 w-3" />
                                {kr.commentCount} {kr.commentCount === 1 ? "comentário" : "comentários"}
                            </span>
                        )}
                        {kr.decisionCount > 0 && (
                            <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30 text-[10px] px-2 py-0 h-5">
                                {kr.decisionCount} {kr.decisionCount === 1 ? "decisão registrada" : "decisões registradas"}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ------- Mini Phasing Chart -------

function MiniPhasingChart({
    kr,
    cycleStartDate,
}: {
    kr: KrReportData;
    cycleStartDate?: string;
}) {
    const phasing = kr.phasing;
    const progressEntries = kr.progressEntries;

    // Build phasing points
    const phasingPoints = phasing
        .map((p) => {
            let dateStr = p.date;
            if (!dateStr && p.month) {
                const dateObj = parseISO(`${p.month}-01`);
                const end = endOfMonth(dateObj);
                dateStr = format(end, "yyyy-MM-dd");
            }
            return { date: dateStr || "", value: p.plannedValue };
        })
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date));

    let cumulative = kr.initialValue;
    const plannedTimeline: { date: string; value: number }[] = [];

    if (cycleStartDate) {
        plannedTimeline.push({ date: cycleStartDate, value: kr.initialValue });
    }

    for (const point of phasingPoints) {
        if (kr.direction === "DECREASING") {
            cumulative -= point.value;
        } else {
            cumulative += point.value;
        }
        plannedTimeline.push({ date: point.date, value: cumulative });
    }

    // Collect dates
    const allDates = new Set<string>();
    plannedTimeline.forEach((p) => allDates.add(p.date));

    const today = format(new Date(), "yyyy-MM-dd");
    allDates.add(today);

    if (progressEntries) {
        for (const entry of progressEntries) {
            allDates.add(format(new Date(entry.recordedAt), "yyyy-MM-dd"));
        }
    }

    const sortedDates = Array.from(allDates).sort();

    // Interpolate planned
    const getPlanned = (date: string) => {
        if (plannedTimeline.length === 0) return kr.initialValue;
        const sorted = [...plannedTimeline].sort((a, b) => a.date.localeCompare(b.date));
        if (date <= sorted[0].date) return sorted[0].value;
        if (date >= sorted[sorted.length - 1].date) return sorted[sorted.length - 1].value;
        const idx = sorted.findIndex((p) => p.date >= date);
        if (idx <= 0) return sorted[0].value;
        const prev = sorted[idx - 1], next = sorted[idx];
        const pT = parseISO(prev.date).getTime(), nT = parseISO(next.date).getTime(), dT = parseISO(date).getTime();
        if (nT === pT) return prev.value;
        return prev.value + (next.value - prev.value) * ((dT - pT) / (nT - pT));
    };

    const chartData = sortedDates.map((date) => {
        const planned = getPlanned(date);
        let real: number | undefined;
        if (progressEntries && date <= today) {
            const dateEnd = parseISO(date);
            dateEnd.setHours(23, 59, 59, 999);
            const ts = dateEnd.getTime();
            const relevant = progressEntries.filter((p) => p.recordedAt <= ts);
            if (relevant.length > 0) {
                relevant.sort((a, b) => a.recordedAt - b.recordedAt);
                real = relevant[relevant.length - 1].value;
            } else if (cycleStartDate && date >= cycleStartDate) {
                real = kr.initialValue;
            }
        }
        return {
            timestamp: parseISO(date).getTime(),
            planejado: Number(planned.toFixed(2)),
            real,
        };
    });

    const hasRealData = chartData.some((d) => d.real !== undefined);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                    <linearGradient id={`planned-${kr._id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`real-${kr._id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" type="number" domain={["dataMin", "dataMax"]} hide />
                <YAxis hide />
                <ReferenceLine y={kr.targetValue} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area
                    type="monotone"
                    dataKey="planejado"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill={`url(#planned-${kr._id})`}
                    dot={false}
                />
                {hasRealData && (
                    <Area
                        type="monotone"
                        dataKey="real"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        fill={`url(#real-${kr._id})`}
                        dot={false}
                        connectNulls
                    />
                )}
            </AreaChart>
        </ResponsiveContainer>
    );
}
