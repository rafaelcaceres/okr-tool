"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { EditKeyResultDialog } from "./edit-key-result-dialog";
import { UpdateProgressDialog } from "./update-progress-dialog";
import { KrStatusBadge } from "./kr-status-badge";
import { KrDetailView } from "./kr-detail-view";
import { PhasingEditor } from "../phasing/phasing-editor";
import { PhasingChart } from "../phasing/phasing-chart";
import {
  type KrType,
  getKrTypeLabel,
  formatKrValue,
  calculateKrProgress,
  getStrategy,
} from "@/lib/kr-types";
import { StageGateConfigEditor } from "./type-config/stage-gate-config-editor";
import { ChecklistConfigEditor } from "./type-config/checklist-config-editor";
import { MultiPhaseConfigEditor } from "./type-config/multi-phase-config-editor";
import { StageGateDisplay } from "./type-display/stage-gate-display";
import { ChecklistDisplay } from "./type-display/checklist-display";
import { MultiPhaseDisplay } from "./type-display/multi-phase-display";
import type {
  StageGateStage,
  ChecklistCategory,
  Workstream,
  CriticalIncident,
} from "@/lib/kr-types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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

function formatValue(kr: Doc<"keyResults">, value: number): string {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);
  return formatKrValue(krType, value, typeConfig);
}

function getProgressPercent(kr: Doc<"keyResults">): number {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);
  return Math.round(
    calculateKrProgress({
      krType,
      currentValue: kr.currentValue,
      initialValue: kr.initialValue,
      targetValue: kr.targetValue,
      typeConfig,
    })
  );
}

function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function CollapsibleChart({
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
    <div className="mt-2">
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

/* ─── Collapsible type detail (stages / checklist / workstreams) ─── */
function CollapsibleTypeDetail({
  kr,
  krType,
  hasStages,
  hasChecklist,
  hasWorkstreams,
}: {
  kr: Doc<"keyResults">;
  krType: KrType;
  hasStages: boolean;
  hasChecklist: boolean;
  hasWorkstreams: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!hasStages && !hasChecklist && !hasWorkstreams) return null;

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
            <StageGateDisplay
              config={kr.typeConfig as { stages: StageGateStage[] }}
            />
          )}
          {hasChecklist && (
            <ChecklistDisplay
              config={
                kr.typeConfig as {
                  categories: ChecklistCategory[];
                  evaluationFrequency: string;
                }
              }
            />
          )}
          {hasWorkstreams && (
            <MultiPhaseDisplay
              config={
                kr.typeConfig as {
                  workstreams: Workstream[];
                  criticalIncidents: CriticalIncident[];
                  maxTolerableIncidents: number;
                }
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

interface KeyResultListProps {
  objectiveId: Id<"objectives">;
  cycleStartDate?: string;
  cycleEndDate?: string;
  cycleStatus?: string;
}

export function KeyResultList({
  objectiveId,
  cycleStartDate,
  cycleEndDate,
  cycleStatus,
}: KeyResultListProps) {
  const currentDate = getCurrentDate();
  const keyResults = useQuery(api.keyResults.getKeyResultsWithHealth, {
    objectiveId,
    currentDate,
  });
  const deleteKeyResult = useMutation(api.keyResults.deleteKeyResult);

  if (keyResults === undefined) {
    return <div className="text-xs text-muted-foreground">Carregando KRs...</div>;
  }

  if (keyResults.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic py-2">
        Nenhum Key Result adicionado.
      </div>
    );
  }

  const handleDelete = async (id: Id<"keyResults">) => {
    try {
      await deleteKeyResult({ id });
      toast.success("Key Result excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir Key Result"
      );
    }
  };

  const canShowPhasing = cycleStartDate && cycleEndDate;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {keyResults.map((kr) => {
        const krType = resolveKrType(kr);
        const strategy = getStrategy(krType);
        const progress = getProgressPercent(kr);
        const supportsPhasing = strategy.supportsPhasing;
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
          ((kr.typeConfig as { stages?: StageGateStage[] })?.stages?.length ??
            0) > 0;
        const hasChecklist =
          krType === "CHECKLIST_COMPLIANCE" &&
          ((kr.typeConfig as { categories?: ChecklistCategory[] })?.categories
            ?.length ?? 0) > 0;
        const hasWorkstreams =
          krType === "MULTI_PHASE_WITH_RISK" &&
          ((kr.typeConfig as { workstreams?: Workstream[] })?.workstreams
            ?.length ?? 0) > 0;
        const needsConfig =
          (krType === "STAGE_GATE" && !hasStages) ||
          (krType === "CHECKLIST_COMPLIANCE" && !hasChecklist) ||
          (krType === "MULTI_PHASE_WITH_RISK" && !hasWorkstreams);

        return (
          <div
            key={kr._id}
            className="bg-card rounded-lg border border-border/80 group hover:border-border transition-colors"
          >
            {/* ─── Header: title row ─── */}
            <div className="px-3 pt-3 pb-1.5">
              <div className="flex items-start gap-2">
                {/* Status dot */}
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${healthColor}`} />

                {/* Title */}
                <p className="text-sm font-medium leading-snug text-foreground flex-1 min-w-0 line-clamp-2">
                  {kr.title}
                </p>

                {/* Primary: update progress — always visible */}
                <div className="shrink-0 -mt-0.5">
                  <UpdateProgressDialog keyResult={kr} />
                </div>
              </div>
            </div>

            {/* ─── Metrics row ─── */}
            <div className="px-3 pb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 h-4 leading-none font-normal text-muted-foreground shrink-0"
              >
                {getKrTypeLabel(krType)}
              </Badge>

              <span className="text-xs text-muted-foreground tabular-nums truncate">
                {formatValue(kr, kr.currentValue)} / {formatValue(kr, kr.targetValue)}
              </span>

              <div className="flex-1" />

              <KrStatusBadge health={kr.health} />

              <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
                {progress}%
              </span>
            </div>

            {/* ─── Progress bar ─── */}
            <div className="px-3 pb-2.5">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${kr.hasProgress
                    ? healthColor
                    : progress >= 100
                      ? "bg-success"
                      : "bg-primary"
                    }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* ─── Hover actions bar ─── */}
            <div className="border-t border-border/50 px-2 py-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <KrDetailView keyResult={kr} health={kr.health} />

              {kr.externalLink && (
                <a
                  href={kr.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-6 w-6 text-muted-foreground hover:text-blue-600 rounded-md hover:bg-muted transition-colors"
                  title="Abrir link externo"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {krType === "STAGE_GATE" && (
                <StageGateConfigEditor keyResult={kr} />
              )}
              {krType === "CHECKLIST_COMPLIANCE" && (
                <ChecklistConfigEditor keyResult={kr} />
              )}
              {krType === "MULTI_PHASE_WITH_RISK" && (
                <MultiPhaseConfigEditor keyResult={kr} />
              )}
              {canShowPhasing && supportsPhasing && (
                <PhasingEditor
                  keyResult={kr}
                  cycleStartDate={cycleStartDate}
                  cycleEndDate={cycleEndDate}
                />
              )}
              <EditKeyResultDialog keyResult={kr} />

              <div className="flex-1" />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    aria-label="Excluir Key Result"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Excluir Key Result?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {kr.hasProgress
                        ? "Atenção: este Key Result possui progresso registrado. Esta ação não pode ser desfeita e todos os dados serão perdidos."
                        : "Esta ação não pode ser desfeita."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(kr._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* ─── Empty config CTA ─── */}
            {needsConfig && (
              <div className="border-t border-dashed px-3 py-2 flex items-center gap-2 bg-muted/20">
                <p className="text-xs text-muted-foreground flex-1">
                  {krType === "STAGE_GATE" && "Configure os estágios deste KR"}
                  {krType === "CHECKLIST_COMPLIANCE" && "Configure o checklist deste KR"}
                  {krType === "MULTI_PHASE_WITH_RISK" && "Configure os workstreams deste KR"}
                </p>
                {krType === "STAGE_GATE" && (
                  <StageGateConfigEditor keyResult={kr} />
                )}
                {krType === "CHECKLIST_COMPLIANCE" && (
                  <ChecklistConfigEditor keyResult={kr} />
                )}
                {krType === "MULTI_PHASE_WITH_RISK" && (
                  <MultiPhaseConfigEditor keyResult={kr} />
                )}
              </div>
            )}

            {/* ─── Collapsible type detail ─── */}
            <div className="px-3 pb-2">
              <CollapsibleTypeDetail
                kr={kr}
                krType={krType}
                hasStages={hasStages}
                hasChecklist={hasChecklist}
                hasWorkstreams={hasWorkstreams}
              />

              {/* Phasing chart */}
              {supportsPhasing && (
                <CollapsibleChart
                  keyResult={kr}
                  cycleStartDate={cycleStartDate}
                  cycleEndDate={cycleEndDate}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
