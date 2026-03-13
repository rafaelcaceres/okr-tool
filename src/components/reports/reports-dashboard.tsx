"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartColors } from "@/lib/use-chart-colors";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    LabelList,
    PieChart,
    Pie,
} from "recharts";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface FranchiseSummary {
    _id: string;
    name: string;
    avgProgress: number;
    predominantHealth: string;
}

interface ReportsDashboardProps {
    franchises: FranchiseSummary[];
    globalHealth: Record<HealthStatus, number>;
    globalTotalKRs: number;
}

const healthLabels: Record<HealthStatus, string> = {
    ON_TRACK: "Em Dia",
    AT_RISK: "Em Risco",
    LATE: "Atrasado",
    COMPLETED: "Concluído",
    NOT_STARTED: "Não Iniciado",
};

const healthDotClasses: Record<HealthStatus, string> = {
    ON_TRACK: "bg-success",
    COMPLETED: "bg-success",
    AT_RISK: "bg-warning",
    LATE: "bg-destructive",
    NOT_STARTED: "bg-muted-foreground/40",
};

export function ReportsDashboard({
    franchises,
    globalHealth,
    globalTotalKRs,
}: ReportsDashboardProps) {
    const colors = useChartColors();

    const healthFills: Record<string, string> = {
        ON_TRACK: colors.success,
        AT_RISK: colors.warning,
        LATE: colors.destructive,
        COMPLETED: colors.success,
        NOT_STARTED: colors.mutedForeground,
    };

    // Bar chart data
    const barData = franchises
        .map((f) => ({
            name: f.name,
            progress: f.avgProgress,
            health: f.predominantHealth,
        }))
        .sort((a, b) => b.progress - a.progress);

    // Donut data
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

    if (franchises.length === 0) return null;

    return (
        <div className="grid gap-5 lg:grid-cols-5">
            {/* Bar Chart — Franchise Comparison */}
            <Card className="lg:col-span-3 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Progresso por Franquia
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ height: Math.max(120, franchises.length * 50) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                layout="vertical"
                                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                            >
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                    fontSize={11}
                                    stroke={colors.mutedForeground}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    fontSize={12}
                                    stroke={colors.mutedForeground}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Bar
                                    dataKey="progress"
                                    radius={[0, 4, 4, 0]}
                                    barSize={24}
                                    background={{ fill: colors.muted, radius: 4 }}
                                >
                                    {barData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={healthFills[entry.health] ?? colors.primary}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="progress"
                                        position="right"
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={((v: any) => `${v}%`) as any}
                                        style={{
                                            fontSize: 12,
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

            {/* Donut — Global Health */}
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Saúde Global dos KRs
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="w-44 h-44 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="55%"
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
                            <span className="text-2xl font-bold text-foreground tabular-nums">
                                {globalTotalKRs}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                KRs
                            </span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {donutData.map((d) => (
                            <span key={d.status} className="flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        healthDotClasses[d.status]
                                    )}
                                />
                                {d.value} {d.name}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
