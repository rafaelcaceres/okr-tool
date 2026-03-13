"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LabelList,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface ObjectiveSummary {
    title: string;
    progress: number;
    status: string;
}

interface FranchiseExecutiveSummaryProps {
    overallProgress: number;
    healthSummary: Record<HealthStatus, number>;
    totalKRs: number;
    objectives: ObjectiveSummary[];
    progressTimeline: Array<{ month: string; planned: number; actual: number }>;
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

const monthLabels: Record<string, string> = {
    "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
    "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function formatMonth(month: string): string {
    const [, m] = month.split("-");
    return monthLabels[m] ?? m;
}

export function FranchiseExecutiveSummary({
    overallProgress,
    healthSummary,
    totalKRs,
    objectives,
    progressTimeline,
}: FranchiseExecutiveSummaryProps) {
    const colors = useChartColors();

    const healthFills: Record<HealthStatus, string> = {
        ON_TRACK: colors.success,
        AT_RISK: colors.warning,
        LATE: colors.destructive,
        COMPLETED: colors.success,
        NOT_STARTED: colors.mutedForeground,
    };

    const statusFills: Record<string, string> = {
        COMPLETED: colors.success,
        AT_RISK: colors.warning,
        LATE: colors.destructive,
        IN_PROGRESS: colors.primary,
        NOT_STARTED: colors.mutedForeground,
    };

    // Gauge data
    const gaugeData = [{ value: overallProgress, fill: colors.primary }];

    // Donut data
    const donutData = (
        ["ON_TRACK", "COMPLETED", "AT_RISK", "LATE", "NOT_STARTED"] as HealthStatus[]
    )
        .filter((s) => healthSummary[s] > 0)
        .map((status) => ({
            name: healthLabels[status],
            value: healthSummary[status],
            fill: healthFills[status],
            status,
        }));

    // Bar data for objectives
    const barData = objectives
        .map((o) => ({
            name: o.title.length > 30 ? o.title.slice(0, 28) + "…" : o.title,
            progress: o.progress,
            status: o.status,
        }))
        .sort((a, b) => b.progress - a.progress);

    // Area chart data
    const areaData = progressTimeline.map((t) => ({
        ...t,
        label: formatMonth(t.month),
    }));

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* B1: Progress Gauge */}
            <Card className="shadow-sm">
                <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Progresso Geral
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center pb-5">
                    <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="65%"
                                outerRadius="95%"
                                startAngle={90}
                                endAngle={-270}
                                data={gaugeData}
                                barSize={14}
                            >
                                <RadialBar
                                    dataKey="value"
                                    background={{ fill: colors.muted }}
                                    cornerRadius={6}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-foreground tabular-nums">
                                {overallProgress}%
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                concluído
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* B2: Health Donut */}
            <Card className="shadow-sm">
                <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Saúde dos KRs
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pb-5">
                    <div className="w-36 h-36 relative">
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
                            <span className="text-xl font-bold text-foreground tabular-nums">
                                {totalKRs}
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase">KRs</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                        {donutData.map((d) => (
                            <span key={d.status} className="flex items-center gap-1">
                                <span className={cn("w-1.5 h-1.5 rounded-full", healthDotClasses[d.status])} />
                                {d.value} {d.name}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* B3: Objectives Comparison Bar */}
            {barData.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Progresso por Objetivo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ height: Math.max(100, barData.length * 44) }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 35, left: 0, bottom: 0 }}
                                >
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        fontSize={11}
                                        stroke={colors.mutedForeground}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Bar
                                        dataKey="progress"
                                        radius={[0, 4, 4, 0]}
                                        barSize={18}
                                        background={{ fill: colors.muted, radius: 4 }}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={statusFills[entry.status] ?? colors.primary}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="progress"
                                            position="right"
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={((v: any) => `${v}%`) as any}
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                fill: colors.foreground,
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* B4: Timeline — Planned vs Actual */}
            {areaData.length > 1 && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Evolução — Planejado vs Real
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={areaData}
                                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={colors.border}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        fontSize={11}
                                        stroke={colors.mutedForeground}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        fontSize={10}
                                        stroke={colors.mutedForeground}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: "6px",
                                            fontSize: 12,
                                        }}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={((value: any, name: string) => [
                                            `${value}%`,
                                            name === "planned" ? "Planejado" : "Real",
                                        ]) as any}
                                    />
                                    <Legend
                                        formatter={(value) =>
                                            value === "planned" ? "Planejado" : "Real"
                                        }
                                        wrapperStyle={{ fontSize: 11 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="planned"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="url(#gradPlanned)"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        stroke={colors.success}
                                        strokeWidth={2}
                                        fill="url(#gradActual)"
                                        dot={{ r: 3, fill: colors.success }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
