"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CLevelHeaderProps {
  cycleName: string;
  cycleStartDate: string;
  cycleEndDate: string;
  selectedCycleId: string;
  onCycleChange: (value: string) => void;
  eligibleCycles: Array<{ _id: string; name: string; status: string }>;
}

function formatCycleDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return format(new Date(y, m - 1, d), "dd MMM yyyy", { locale: ptBR });
}

export function CLevelHeader({
  cycleName,
  cycleStartDate,
  cycleEndDate,
  selectedCycleId,
  onCycleChange,
  eligibleCycles,
}: CLevelHeaderProps) {
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Painel Executivo
        </h1>
        <p className="text-muted-foreground">
          Visão consolidada de todas as franquias
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {cycleName} · {formatCycleDate(cycleStartDate)} — {formatCycleDate(cycleEndDate)}
          </span>
          <span>Gerado em {today}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
        <div className="px-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
        </div>
        <Select value={selectedCycleId} onValueChange={onCycleChange}>
          <SelectTrigger className="w-[220px] border-none shadow-none h-8 focus:ring-0">
            <SelectValue placeholder="Selecione um ciclo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ciclo mais recente</SelectItem>
            {eligibleCycles.map((cycle) => (
              <SelectItem key={cycle._id} value={cycle._id}>
                {cycle.name} (
                {cycle.status === "ATIVO"
                  ? "Ativo"
                  : cycle.status === "FINALIZADO"
                    ? "Finalizado"
                    : "Encerrado"}
                )
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
