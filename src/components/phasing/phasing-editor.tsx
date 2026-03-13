"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { type KrType } from "@/lib/kr-types";
import type { StageGateStage, Workstream, WorkstreamPhase } from "@/lib/kr-types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  format,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachQuarterOfInterval,
  endOfMonth,
  endOfWeek,
  endOfQuarter,
  parseISO,
  subDays,
  isValid as isValidDate,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarRange } from "lucide-react";

interface PhasingEditorProps {
  keyResult: Doc<"keyResults">;
  cycleStartDate: string;
  cycleEndDate: string;
}

type Frequency = "MONTHLY" | "WEEKLY" | "QUARTERLY";

// ─── Type-aware configuration ──────────────────────────────────────────────

type PhasingMode = "cumulative" | "point_in_time" | "timeline";

interface TypePhasingConfig {
  dialogTitle: string;
  description: string;
  fieldLabel: (period: string) => string;
  mode: PhasingMode;
  step: string;
  min: number;
  max?: number;
  distributeLabel: string;
}

function resolveKrType(kr: Doc<"keyResults">): KrType {
  if (kr.krType) return kr.krType as KrType;
  switch (kr.measurementType) {
    case "FINANCIAL":
    case "NUMERIC":
      return "CUMULATIVE_NUMERIC";
    case "PERCENTUAL":
      return "PROGRESSIVE_PERCENTAGE";
    case "MILESTONE":
      return "STAGE_GATE";
    default:
      return "CUMULATIVE_NUMERIC";
  }
}

function getTypePhasingConfig(krType: KrType): TypePhasingConfig {
  switch (krType) {
    case "STAGE_GATE":
      return {
        dialogTitle: "Planejar Cronograma de Estágios",
        description: "Atribua cada estágio ao período em que deve ser concluído.",
        mode: "timeline",
        fieldLabel: () => "Estágios a concluir",
        step: "1",
        min: 0,
        distributeLabel: "Distribuir Igualmente",
      };
    case "CHECKLIST_COMPLIANCE":
      return {
        dialogTitle: "Planejar Metas de Compliance",
        description: "Defina o percentual de compliance esperado ao final de cada período.",
        fieldLabel: () => "% compliance alvo",
        mode: "point_in_time",
        step: "1",
        min: 0,
        max: 100,
        distributeLabel: "Distribuir Linearmente",
      };
    case "MULTI_PHASE_WITH_RISK":
      return {
        dialogTitle: "Planejar Cronograma de Fases",
        description: "Atribua cada fase ao período em que deve ser concluída.",
        mode: "timeline",
        fieldLabel: () => "Fases a concluir",
        step: "1",
        min: 0,
        distributeLabel: "Distribuir Igualmente",
      };
    case "PERIODIC_INDEX":
      return {
        dialogTitle: "Planejar Metas por Período",
        description: "Defina a meta esperada para cada período. Cada valor é independente (não cumulativo).",
        fieldLabel: () => "Meta do período",
        mode: "point_in_time",
        step: "any",
        min: 0,
        distributeLabel: "Preencher com Meta",
      };
    case "PROGRESSIVE_PERCENTAGE":
      return {
        dialogTitle: "Planejar Progresso",
        description: "Distribua o progresso esperado ao longo dos períodos do ciclo.",
        fieldLabel: () => "Meta para o período",
        mode: "cumulative",
        step: "any",
        min: 0,
        distributeLabel: "Distribuir Linearmente",
      };
    case "CUMULATIVE_NUMERIC":
    default:
      return {
        dialogTitle: "Planejar Progresso",
        description: "Distribua o progresso esperado ao longo dos períodos do ciclo.",
        fieldLabel: () => "Meta para o período",
        mode: "cumulative",
        step: "any",
        min: 0,
        distributeLabel: "Distribuir Linearmente",
      };
  }
}

// ─── Timeline item types ─────────────────────────────────────────────────

interface TimelineItem {
  id: string;
  name: string;
  group?: string; // workstream name for multi-phase
}

function getTimelineItems(kr: Doc<"keyResults">, krType: KrType): TimelineItem[] {
  const config = kr.typeConfig as Record<string, unknown> | undefined;
  if (!config) return [];

  if (krType === "STAGE_GATE") {
    const stages = (config.stages as StageGateStage[]) ?? [];
    return stages.map((s, i) => ({
      id: `stage-${i}`,
      name: s.name,
    }));
  }

  if (krType === "MULTI_PHASE_WITH_RISK") {
    const workstreams = (config.workstreams as Workstream[]) ?? [];
    const items: TimelineItem[] = [];
    for (const ws of workstreams) {
      for (const phase of ws.phases) {
        items.push({
          id: `${ws.id}-${phase.id}`,
          name: phase.name,
          group: ws.name,
        });
      }
    }
    return items;
  }

  return [];
}

function getTotalPhasesForMultiPhase(kr: Doc<"keyResults">): number {
  const config = kr.typeConfig as { workstreams?: Workstream[] } | undefined;
  if (!config?.workstreams) return 0;
  return config.workstreams.reduce((sum, ws) => sum + ws.phases.length, 0);
}

// ─── Period helpers ─────────────────────────────────────────────────────────

function getCyclePeriods(startDate: string, endDate: string, frequency: Frequency): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (!isValidDate(start) || !isValidDate(end)) return [];

  if (frequency === "QUARTERLY") {
    return eachQuarterOfInterval({ start, end }).map((q) =>
      format(endOfQuarter(q), "yyyy-MM-dd")
    );
  } else if (frequency === "MONTHLY") {
    return eachMonthOfInterval({ start, end }).map((m) =>
      format(endOfMonth(m), "yyyy-MM-dd")
    );
  } else {
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((w) =>
      format(endOfWeek(w, { weekStartsOn: 1 }), "yyyy-MM-dd")
    );
  }
}

function formatPeriodLabel(dateStr: string, frequency: Frequency): string {
  const date = parseISO(dateStr);
  if (!isValidDate(date)) return dateStr;

  if (frequency === "QUARTERLY") {
    const q = Math.ceil((date.getMonth() + 1) / 3);
    return `Q${q} ${format(date, "yyyy")}`;
  } else if (frequency === "MONTHLY") {
    return format(date, "MMM yyyy", { locale: ptBR });
  } else {
    const start = subDays(date, 6);
    return `${format(start, "dd/MM")} - ${format(date, "dd/MM")}`;
  }
}

// ─── Timeline Editor sub-component ──────────────────────────────────────────

function TimelineEditor({
  items,
  periods,
  frequency,
  assignments,
  onAssign,
}: {
  items: TimelineItem[];
  periods: string[];
  frequency: Frequency;
  assignments: Record<string, string>; // item id -> period date
  onAssign: (itemId: string, period: string) => void;
}) {
  let currentGroup: string | undefined;

  return (
    <div className="grid gap-2">
      {items.map((item) => {
        const showGroup = item.group && item.group !== currentGroup;
        if (item.group) currentGroup = item.group;

        return (
          <div key={item.id}>
            {showGroup && (
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 mb-1">
                {item.group}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Label className="flex-1 text-sm truncate" title={item.name}>
                {item.name}
              </Label>
              <Select
                value={assignments[item.id] || "unassigned"}
                onValueChange={(v) => onAssign(item.id, v)}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Sem período —</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {formatPeriodLabel(p, frequency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PhasingEditor({
  keyResult,
  cycleStartDate,
  cycleEndDate,
}: PhasingEditorProps) {
  const [open, setOpen] = useState(false);
  const existingPhasing = useQuery(api.phasing.getPhasing, {
    keyResultId: keyResult._id,
  });
  const savePhasing = useMutation(api.phasing.savePhasing);

  const krType = resolveKrType(keyResult);
  const typeConfig = getTypePhasingConfig(krType);
  const isCumulative = typeConfig.mode === "cumulative";
  const isTimeline = typeConfig.mode === "timeline";

  const [frequency, setFrequency] = useState<Frequency>(
    keyResult.planningFrequency ?? "MONTHLY"
  );

  const periods = useMemo(
    () => getCyclePeriods(cycleStartDate, cycleEndDate, frequency),
    [cycleStartDate, cycleEndDate, frequency]
  );

  const timelineItems = useMemo(
    () => isTimeline ? getTimelineItems(keyResult, krType) : [],
    [isTimeline, keyResult, krType]
  );

  const expectedTotal = Math.abs(keyResult.targetValue - keyResult.initialValue);

  const [values, setValues] = useState<Record<string, number>>({});
  const [timelineAssignments, setTimelineAssignments] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize values when dialog opens and data is loaded
  useEffect(() => {
    if (open && existingPhasing !== undefined && !initialized) {
      if (keyResult.planningFrequency) {
        // eslint-disable-next-line
        setFrequency(keyResult.planningFrequency);
      } else {
        setFrequency("MONTHLY");
      }

      if (isTimeline) {
        // For timeline mode, reconstruct assignments from existing phasing
        // Each phasing entry has a date and plannedValue (cumulative index)
        // We need to figure out which items are assigned to which periods
        const sorted = [...(existingPhasing || [])]
          .filter((p) => p.date)
          .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

        const newAssignments: Record<string, string> = {};
        let prevCumulative = 0;

        for (const entry of sorted) {
          const date = entry.date!;
          const cumulative = entry.plannedValue;
          const count = cumulative - prevCumulative;

          // Assign `count` items to this period
          let assigned = 0;
          for (const item of timelineItems) {
            if (newAssignments[item.id]) continue;
            if (assigned >= count) break;
            newAssignments[item.id] = date;
            assigned++;
          }
          prevCumulative = cumulative;
        }

        setTimelineAssignments(newAssignments);
      } else {
        const initial: Record<string, number> = {};
        for (const p of existingPhasing) {
          let dateKey = p.date;
          if (!dateKey && p.month && frequency === "MONTHLY") {
            try {
              dateKey = format(endOfMonth(parseISO(p.month + "-01")), "yyyy-MM-dd");
            } catch {
              console.error("Invalid legacy month format", p.month);
            }
          }
          if (dateKey && periods.includes(dateKey)) {
            initial[dateKey] = p.plannedValue;
          }
        }
        setValues(initial);
      }

      setInitialized(true);
    }
  }, [open, existingPhasing, initialized, periods, keyResult.planningFrequency, frequency, isTimeline, timelineItems]);

  const handleFrequencyChange = (newFreq: Frequency) => {
    setFrequency(newFreq);
    setValues({});
    setTimelineAssignments({});
  };

  // Cumulative accumulated values for display
  const accumulatedValues = useMemo(() => {
    if (!isCumulative) return {};
    const acc: Record<string, number> = {};
    let running = keyResult.initialValue;
    for (const period of periods) {
      const delta = values[period] ?? 0;
      if (keyResult.direction === "DECREASING") {
        running -= delta;
      } else {
        running += delta;
      }
      acc[period] = running;
    }
    return acc;
  }, [isCumulative, periods, values, keyResult.initialValue, keyResult.direction]);

  const currentSum = Object.values(values).reduce((sum, v) => sum + v, 0);

  const isValid = isTimeline
    ? timelineItems.length > 0 && timelineItems.every((item) => timelineAssignments[item.id])
    : isCumulative
      ? Math.abs(currentSum - expectedTotal) < 0.01
      : Object.keys(values).length > 0;

  const handleDistribute = () => {
    if (periods.length === 0) return;

    if (isTimeline) {
      // Distribute items evenly across periods
      const newAssignments: Record<string, string> = {};
      const itemsPerPeriod = Math.ceil(timelineItems.length / periods.length);
      timelineItems.forEach((item, i) => {
        const periodIndex = Math.min(Math.floor(i / itemsPerPeriod), periods.length - 1);
        newAssignments[item.id] = periods[periodIndex];
      });
      setTimelineAssignments(newAssignments);
      return;
    }

    const newValues: Record<string, number> = {};

    if (!isCumulative) {
      periods.forEach((period) => {
        newValues[period] = keyResult.targetValue;
      });
    } else {
      const perPeriod = Math.floor(expectedTotal / periods.length);
      const remainder = expectedTotal - perPeriod * periods.length;
      periods.forEach((period, i) => {
        newValues[period] = perPeriod + (i === periods.length - 1 ? remainder : 0);
      });
    }

    setValues(newValues);
  };

  const handleSave = async () => {
    if (isCumulative && !isValid) {
      toast.error(
        `A soma das metas (${currentSum}) deve ser igual à meta total do KR (${expectedTotal}).`
      );
      return;
    }

    try {
      let entries: { date: string; plannedValue: number }[];

      if (isTimeline) {
        // Convert timeline assignments to cumulative phasing entries
        // Group items by period, then create entries with cumulative count
        const periodCounts: Record<string, number> = {};
        for (const item of timelineItems) {
          const period = timelineAssignments[item.id];
          if (period && period !== "unassigned") {
            periodCounts[period] = (periodCounts[period] ?? 0) + 1;
          }
        }

        let cumulative = 0;
        entries = periods
          .filter((p) => periodCounts[p])
          .map((date) => {
            cumulative += periodCounts[date];
            return { date, plannedValue: cumulative };
          });
      } else {
        entries = periods.map((date) => ({
          date,
          plannedValue: values[date] ?? 0,
        }));
      }

      await savePhasing({
        keyResultId: keyResult._id,
        entries,
        planningFrequency: frequency,
      });

      toast.success("Planejamento salvo com sucesso.");
      setOpen(false);
      setInitialized(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar planejamento."
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setInitialized(false);
    }
  };

  const hasPhasing = existingPhasing && existingPhasing.length > 0;

  // Context info for the header
  let metaInfo: string;
  if (krType === "STAGE_GATE") {
    const stages = ((keyResult.typeConfig as Record<string, unknown>)?.stages as StageGateStage[]) ?? [];
    metaInfo = `${stages.length} estágios configurados`;
  } else if (krType === "MULTI_PHASE_WITH_RISK") {
    const totalPhases = getTotalPhasesForMultiPhase(keyResult);
    metaInfo = `${totalPhases} fases no total`;
  } else if (krType === "CHECKLIST_COMPLIANCE") {
    metaInfo = `Meta: ${keyResult.targetValue}% compliance`;
  } else if (krType === "PERIODIC_INDEX") {
    metaInfo = `Meta: ${keyResult.targetValue} ${keyResult.unit}`;
  } else {
    metaInfo = `Meta total: ${expectedTotal} (${keyResult.initialValue} → ${keyResult.targetValue})`;
  }

  // Timeline validation info
  const timelineAssignedCount = isTimeline
    ? timelineItems.filter((item) => timelineAssignments[item.id] && timelineAssignments[item.id] !== "unassigned").length
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1 px-2"
          title="Planejar Progresso (Phasing)"
        >
          <CalendarRange className="h-3 w-3" />
          {hasPhasing ? "Editar Phasing" : "Planejar Progresso"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{typeConfig.dialogTitle} — {keyResult.title}</DialogTitle>
          <DialogDescription>{typeConfig.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {metaInfo}
            </div>

            <Select
              value={frequency}
              onValueChange={(v) => handleFrequencyChange(v as Frequency)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="QUARTERLY">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDistribute}
              className="text-xs"
            >
              {typeConfig.distributeLabel}
            </Button>
          </div>

          {/* Timeline mode: show items with period selectors */}
          {isTimeline ? (
            timelineItems.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                {krType === "STAGE_GATE"
                  ? "Nenhum estágio configurado. Configure os estágios antes de planejar o cronograma."
                  : "Nenhuma fase configurada. Configure os workstreams antes de planejar o cronograma."}
              </div>
            ) : (
              <TimelineEditor
                items={timelineItems}
                periods={periods}
                frequency={frequency}
                assignments={timelineAssignments}
                onAssign={(itemId, period) => {
                  setTimelineAssignments((prev) => ({
                    ...prev,
                    [itemId]: period === "unassigned" ? "" : period,
                  }));
                }}
              />
            )
          ) : (
            /* Numeric mode: show period inputs */
            <div className="grid gap-3">
              {periods.map((period) => (
                <div key={period} className="flex items-center gap-3">
                  <Label className="w-32 text-sm capitalize shrink-0 text-right">
                    {formatPeriodLabel(period, frequency)}
                  </Label>
                  <Input
                    type="number"
                    min={typeConfig.min}
                    max={typeConfig.max}
                    step="any"
                    value={values[period] ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "" || raw === "-") {
                        setValues((prev) => ({ ...prev, [period]: 0 }));
                        return;
                      }
                      let val = parseFloat(raw);
                      if (isNaN(val)) val = 0;
                      val = Math.max(typeConfig.min, val);
                      if (typeConfig.max !== undefined) val = Math.min(typeConfig.max, val);
                      setValues((prev) => ({ ...prev, [period]: val }));
                    }}
                    className="flex-1 h-8 text-sm"
                    placeholder={typeConfig.fieldLabel(period)}
                  />
                  {isCumulative && (
                    <span className="w-24 text-right text-sm text-muted-foreground tabular-nums">
                      {accumulatedValues[period]?.toLocaleString("pt-BR") ?? "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Validation footer */}
          {isTimeline ? (
            <div
              className={`flex items-center justify-between text-sm font-medium px-1 pt-2 border-t ${
                isValid ? "text-green-600" : "text-amber-600"
              }`}
            >
              <span>{timelineAssignedCount} de {timelineItems.length} atribuídos</span>
              <span>
                {isValid
                  ? "Todos atribuídos"
                  : `Faltam ${timelineItems.length - timelineAssignedCount}`}
              </span>
            </div>
          ) : isCumulative ? (
            <div
              className={`flex items-center justify-between text-sm font-medium px-1 pt-2 border-t ${
                isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>Soma: {currentSum}</span>
              <span>
                {isValid
                  ? "Soma igual à meta"
                  : `Faltam ${expectedTotal - currentSum}`}
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground px-1 pt-2 border-t">
              Cada período tem uma meta independente (valores não são somados).
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
