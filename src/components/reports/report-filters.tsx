"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HealthFilter = "ON_TRACK" | "AT_RISK" | "LATE" | "NOT_STARTED" | "COMPLETED";

interface ReportFiltersProps {
    activeFilters: HealthFilter[];
    onToggleFilter: (filter: HealthFilter) => void;
    onClearFilters: () => void;
}

const filterConfig: { key: HealthFilter; label: string; activeClass: string; dotClass: string }[] = [
    {
        key: "ON_TRACK",
        label: "Em Dia",
        activeClass: "bg-success/15 text-success border-success/40",
        dotClass: "bg-success",
    },
    {
        key: "AT_RISK",
        label: "Em Risco",
        activeClass: "bg-warning/15 text-warning-foreground border-warning/40",
        dotClass: "bg-warning",
    },
    {
        key: "LATE",
        label: "Atrasado",
        activeClass: "bg-destructive/15 text-destructive border-destructive/40",
        dotClass: "bg-destructive",
    },
    {
        key: "COMPLETED",
        label: "Concluído",
        activeClass: "bg-success/15 text-success border-success/40",
        dotClass: "bg-success",
    },
    {
        key: "NOT_STARTED",
        label: "Não Iniciado",
        activeClass: "bg-muted text-muted-foreground border-border",
        dotClass: "bg-muted-foreground/50",
    },
];

export function ReportFilters({
    activeFilters,
    onToggleFilter,
    onClearFilters,
}: ReportFiltersProps) {
    const hasFilters = activeFilters.length > 0;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filtrar por status:</span>
            {filterConfig.map((f) => {
                const isActive = activeFilters.includes(f.key);
                return (
                    <button
                        key={f.key}
                        onClick={() => onToggleFilter(f.key)}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                            isActive
                                ? f.activeClass
                                : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                        )}
                    >
                        <span className={cn("w-2 h-2 rounded-full shrink-0", f.dotClass)} />
                        {f.label}
                    </button>
                );
            })}
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                    <X className="h-3 w-3" />
                    Limpar
                </Button>
            )}
        </div>
    );
}
