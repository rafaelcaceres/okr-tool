"use client";

import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type HealthStatus = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface ReportHeaderProps {
    franchiseName: string;
    cycleName: string;
    cycleStartDate: string;
    cycleEndDate: string;
    healthSummary: Record<HealthStatus, number>;
    totalKRs: number;
    selectedCycleId: string;
    onCycleChange: (value: string) => void;
    eligibleCycles: Array<{ _id: string; name: string; status: string }>;
}

const healthPillConfig: Record<HealthStatus, { label: string; className: string }> = {
    ON_TRACK: { label: "Em Dia", className: "bg-success/15 text-success border-success/30 dark:border-success/20" },
    AT_RISK: { label: "Em Risco", className: "bg-warning/15 text-warning-foreground border-warning/30 dark:border-warning/20" },
    LATE: { label: "Atrasado", className: "bg-destructive/15 text-destructive border-destructive/30 dark:border-destructive/20" },
    COMPLETED: { label: "Concluído", className: "bg-success/15 text-success border-success/30 dark:border-success/20" },
    NOT_STARTED: { label: "Não Iniciado", className: "bg-muted text-muted-foreground border-border" },
};

function formatCyclePeriod(start: string, end: string): string {
    try {
        const s = parseISO(start);
        const e = parseISO(end);
        return `${format(s, "dd MMM yyyy", { locale: ptBR })} — ${format(e, "dd MMM yyyy", { locale: ptBR })}`;
    } catch {
        return `${start} — ${end}`;
    }
}

export function ReportHeader({
    franchiseName,
    cycleName,
    cycleStartDate,
    cycleEndDate,
    healthSummary,
    totalKRs,
    selectedCycleId,
    onCycleChange,
    eligibleCycles,
}: ReportHeaderProps) {
    const reportDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
        <div className="space-y-5">
            {/* Back link */}
            <Link
                href="/relatorios"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para relatórios
            </Link>

            {/* Main header row */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {franchiseName}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium">{cycleName}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatCyclePeriod(cycleStartDate, cycleEndDate)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                        Relatório gerado em {reportDate}
                    </p>
                </div>

                {/* Cycle selector */}
                <div className="flex items-center gap-2 bg-card border rounded-lg p-1.5 shadow-sm shrink-0">
                    <div className="px-2 text-muted-foreground">
                        <Filter className="h-4 w-4" />
                    </div>
                    <Select value={selectedCycleId} onValueChange={onCycleChange}>
                        <SelectTrigger className="w-[220px] border-none shadow-none h-8 focus:ring-0">
                            <SelectValue placeholder="Ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Ciclo mais recente</SelectItem>
                            {eligibleCycles.map((c) => (
                                <SelectItem key={c._id} value={c._id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Health summary pills */}
            {totalKRs > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground mr-1">
                        {totalKRs} KRs:
                    </span>
                    {(Object.entries(healthSummary) as [HealthStatus, number][])
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => {
                            const config = healthPillConfig[status];
                            return (
                                <Badge
                                    key={status}
                                    variant="outline"
                                    className={`${config.className} text-xs font-semibold px-2.5 py-0.5`}
                                >
                                    {count} {config.label}
                                </Badge>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
