"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { KrStatusBadge } from "@/components/key-results/kr-status-badge";
import { UpdateProgressDialog } from "@/components/key-results/update-progress-dialog";
import { Progress } from "@/components/ui/progress";
import { StageGateDisplay } from "@/components/key-results/type-display/stage-gate-display";
import { ChecklistDisplay } from "@/components/key-results/type-display/checklist-display";
import { MultiPhaseDisplay, RiskBadge } from "@/components/key-results/type-display/multi-phase-display";
import {
  type KrType,
  getKrTypeLabel,
  formatKrValue,
} from "@/lib/kr-types";
import type {
  StageGateStage,
  ChecklistCategory,
  Workstream,
  CriticalIncident,
} from "@/lib/kr-types/types";
import { PhasingChart } from "@/components/phasing/phasing-chart";
import { KrResponsibleAvatars } from "@/components/key-results/kr-responsible-avatars";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";

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

function resolveTypeConfig(kr: Doc<"keyResults">): Record<string, unknown> {
  if (kr.typeConfig) return kr.typeConfig as Record<string, unknown>;
  const direction = kr.direction ?? "INCREASING";
  switch (kr.measurementType) {
    case "FINANCIAL":
      return { direction, unit: kr.currency ?? kr.unit, currency: kr.currency };
    case "PERCENTUAL":
      return { direction };
    case "MILESTONE":
      return { stages: [] };
    default:
      return { direction, unit: kr.unit };
  }
}

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

function CollapsiblePhasingChart({
  keyResult,
  cycleStartDate,
  cycleEndDate,
}: {
  keyResult: Doc<"keyResults">;
  cycleStartDate?: string;
  cycleEndDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const phasing = useQuery(api.phasing.getPhasing, {
    keyResultId: keyResult._id,
  });

  if (phasing === undefined || phasing.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Progresso planejado vs real
      </button>
      {open && (
        <PhasingChart
          keyResult={keyResult}
          cycleStartDate={cycleStartDate}
          cycleEndDate={cycleEndDate}
        />
      )}
    </div>
  );
}

function ChecklistWithHistory({
  keyResultId,
  config,
}: {
  keyResultId: Id<"keyResults">;
  config: { categories: ChecklistCategory[]; evaluationFrequency: string };
}) {
  const entries = useQuery(api.progressEntries.getProgressEntries, {
    keyResultId,
  });
  const history = entries
    ? entries.map((e) => ({
      value: e.value,
      date: new Date(e.recordedAt).toLocaleDateString("pt-BR"),
    }))
    : undefined;
  return <ChecklistDisplay config={config} progressHistory={history} />;
}

function CollapsibleTypeDisplay({
  kr,
  krType,
  typeConfig,
  hasStages,
  hasChecklist,
  hasWorkstreams,
}: {
  kr: Doc<"keyResults">;
  krType: string;
  typeConfig: Record<string, unknown>;
  hasStages: boolean;
  hasChecklist: boolean;
  hasWorkstreams: boolean;
}) {
  const [open, setOpen] = useState(false);

  const label = hasStages
    ? "Estágios"
    : hasChecklist
      ? "Checklist"
      : "Workstreams";

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {label}
      </button>
      {open && (
        <div className="mt-1.5">
          {hasStages && (
            <StageGateDisplay config={typeConfig as { stages: StageGateStage[] }} />
          )}
          {hasChecklist && (
            <ChecklistDisplay
              config={typeConfig as { categories: ChecklistCategory[]; evaluationFrequency: string }}
            />
          )}
          {hasWorkstreams && (
            <MultiPhaseDisplay
              config={typeConfig as { workstreams: Workstream[]; criticalIncidents: CriticalIncident[]; maxTolerableIncidents: number }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ObjectiveGroup({ objectiveId, currentDate, cycleStartDate, cycleEndDate }: { objectiveId: Id<"objectives">; currentDate: string; cycleStartDate?: string; cycleEndDate?: string }) {
  const objective = useQuery(api.objectives.getObjective, { id: objectiveId });
  const keyResults = useQuery(api.keyResults.getKeyResultsWithHealth, {
    objectiveId,
    currentDate,
  });

  if (!objective || keyResults === undefined) return null;

  return (
    <div className="space-y-3 mb-8">
      <div className="flex items-center gap-3 px-1 border-b pb-2">
        <h3 className="text-base font-semibold flex-1 text-foreground">{objective.title}</h3>
        <Progress value={objective.progress} className="h-1.5 w-28" />
        <span className="text-sm text-muted-foreground font-medium tabular-nums w-8 text-right">
          {objective.progress}%
        </span>
      </div>
      <div>
        {keyResults.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 px-1">
            Nenhum Key Result.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {keyResults.map((kr) => {
              const krType = resolveKrType(kr);
              const typeConfig = resolveTypeConfig(kr);
              const displayValue = formatKrValue(krType, kr.currentValue, typeConfig);
              const displayTarget = formatKrValue(krType, kr.targetValue, typeConfig);
              const healthColor =
                kr.health === "ON_TRACK" || kr.health === "COMPLETED"
                  ? "bg-success"
                  : kr.health === "AT_RISK"
                    ? "bg-warning"
                    : kr.health === "LATE"
                      ? "bg-destructive"
                      : "bg-primary";

              const hasStages =
                krType === "STAGE_GATE" &&
                ((typeConfig as { stages?: StageGateStage[] })?.stages?.length ?? 0) > 0;
              const hasChecklist =
                krType === "CHECKLIST_COMPLIANCE" &&
                ((typeConfig as { categories?: ChecklistCategory[] })?.categories?.length ?? 0) > 0;
              const hasWorkstreams =
                krType === "MULTI_PHASE_WITH_RISK" &&
                ((typeConfig as { workstreams?: Workstream[] })?.workstreams?.length ?? 0) > 0;

              const progress = kr.targetValue
                ? Math.min(Number(((kr.currentValue / kr.targetValue) * 100).toFixed(0)), 100)
                : 0;

              return (
                <div key={kr._id} className="bg-card rounded-lg border border-border/80 group hover:border-border transition-colors">
                  {/* ─── Row 1: Title + Avatars + Action ─── */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${healthColor}`} />

                      <p className="text-sm font-medium leading-snug text-foreground flex-1 min-w-0 line-clamp-2">
                        {kr.title}
                      </p>

                      <div className="shrink-0 flex items-center gap-1.5 -mt-0.5">
                        <KrResponsibleAvatars responsibles={kr.resolvedResponsibles} />
                        <UpdateProgressDialog keyResult={kr} />
                      </div>
                    </div>
                  </div>

                  {/* ─── Row 2: Progress bar + percentage ─── */}
                  <div className="px-3 pb-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${healthColor}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground tabular-nums shrink-0 w-8 text-right">
                      {progress}%
                    </span>
                  </div>

                  {/* ─── Row 3: Metadata (subdued) ─── */}
                  <div className="px-3 pb-2.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4 leading-none font-normal text-muted-foreground shrink-0"
                    >
                      {getKrTypeLabel(krType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums truncate">
                      {displayValue} / {displayTarget}
                    </span>
                    <div className="flex-1" />
                    <KrStatusBadge health={kr.health} />
                    {hasWorkstreams && (
                      <RiskBadge
                        criticalIncidents={(typeConfig as { criticalIncidents?: CriticalIncident[] }).criticalIncidents ?? []}
                        maxTolerableIncidents={(typeConfig as { maxTolerableIncidents?: number }).maxTolerableIncidents ?? 0}
                      />
                    )}
                  </div>

                  {/* Collapsible type displays */}
                  <div className="px-3 pb-2">
                    {hasChecklist && (
                      <CollapsibleTypeDisplay
                        kr={kr}
                        krType={krType}
                        typeConfig={typeConfig}
                        hasStages={false}
                        hasChecklist={hasChecklist}
                        hasWorkstreams={false}
                      />
                    )}
                    <CollapsiblePhasingChart
                      keyResult={kr}
                      cycleStartDate={cycleStartDate}
                      cycleEndDate={cycleEndDate}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgressUpdateView() {
  const cycles = useQuery(api.cycles.getCycles);
  const franchises = useQuery(api.franchises.getFranchises);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("all");

  // Filter cycles to only ATIVO and FINALIZADO
  const eligibleCycles = cycles?.filter(
    (c) => c.status === "ATIVO" || c.status === "FINALIZADO"
  );

  const cycleId =
    selectedCycleId && selectedCycleId !== "all"
      ? (selectedCycleId as Id<"cycles">)
      : undefined;

  const franchiseId =
    selectedFranchiseId && selectedFranchiseId !== "all"
      ? (selectedFranchiseId as Id<"franchises">)
      : undefined;

  // If no cycle selected, use the first eligible cycle
  const effectiveCycleId = cycleId ?? eligibleCycles?.[0]?._id;

  const objectives = useQuery(
    api.objectives.getObjectives,
    effectiveCycleId
      ? { cycleId: effectiveCycleId, franchiseId }
      : "skip"
  );

  const effectiveCycle = useQuery(
    api.cycles.getCycle,
    effectiveCycleId ? { id: effectiveCycleId } : "skip"
  );

  const currentDate = getCurrentDate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm w-fit">
        <div className="px-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
        </div>
        <Select
          value={selectedFranchiseId}
          onValueChange={setSelectedFranchiseId}
        >
          <SelectTrigger className="w-[180px] border-none shadow-none h-8 focus:ring-0">
            <SelectValue placeholder="Todas as franquias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as franquias</SelectItem>
            {franchises?.map((franchise) => (
              <SelectItem key={franchise._id} value={franchise._id}>
                {franchise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-px h-4 bg-border mx-1" />
        <Select
          value={selectedCycleId}
          onValueChange={setSelectedCycleId}
        >
          <SelectTrigger className="w-[180px] border-none shadow-none h-8 focus:ring-0">
            <SelectValue placeholder="Ciclo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os ciclos</SelectItem>
            {eligibleCycles?.map((cycle) => (
              <SelectItem key={cycle._id} value={cycle._id}>
                {cycle.name} ({cycle.status === "ATIVO" ? "Ativo" : "Finalizado"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {!effectiveCycleId ? (
        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhum ciclo ativo ou finalizado</p>
          <p className="text-sm mt-1">
            Finalize ou ative um ciclo na área de Planejamento para começar a atualizar o progresso.
          </p>
        </div>
      ) : objectives === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : objectives.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
          Nenhum objetivo encontrado para este ciclo.
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => (
            <ObjectiveGroup
              key={objective._id}
              objectiveId={objective._id}
              currentDate={currentDate}
              cycleStartDate={effectiveCycle?.startDate}
              cycleEndDate={effectiveCycle?.endDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
