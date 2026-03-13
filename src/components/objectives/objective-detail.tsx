"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { CreateKeyResultDialog } from "../key-results/create-key-result-dialog";
import { EditKeyResultDialog } from "../key-results/edit-key-result-dialog";
import { UpdateProgressDialog } from "../key-results/update-progress-dialog";
import { KrDetailView } from "../key-results/kr-detail-view";
import { KrStatusBadge, HealthStatus } from "../key-results/kr-status-badge";
import {
  type KrType,
  getKrTypeLabel,
  formatKrValue,
  calculateKrProgress,
  getStrategy,
} from "@/lib/kr-types";
import type {
  StageGateStage,
  ChecklistCategory,
  Workstream,
  CriticalIncident,
} from "@/lib/kr-types/types";
import { StageGateConfigEditor } from "../key-results/type-config/stage-gate-config-editor";
import { ChecklistConfigEditor } from "../key-results/type-config/checklist-config-editor";
import { MultiPhaseConfigEditor } from "../key-results/type-config/multi-phase-config-editor";
import { StageGateDisplay } from "../key-results/type-display/stage-gate-display";
import { ChecklistDisplay } from "../key-results/type-display/checklist-display";
import { MultiPhaseDisplay, RiskBadge } from "../key-results/type-display/multi-phase-display";
import { PhasingEditor } from "../phasing/phasing-editor";
import { PhasingChart } from "../phasing/phasing-chart";
import { EditObjectiveDialog } from "./edit-objective-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ArrowLeft,
  Trash2,
  ExternalLink,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Não Iniciado",
  IN_PROGRESS: "Em Progresso",
  COMPLETED: "Concluído",
  AT_RISK: "Em Risco",
  LATE: "Atrasado",
};

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
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

function ResponsiblesBadges({ responsibles }: { responsibles?: string[] }) {
  const members = useQuery(api.members.getMembers);
  if (!responsibles || responsibles.length === 0 || !members) return null;

  const names = responsibles
    .map((id) => members.find((m) => m._id === id)?.name)
    .filter(Boolean);
  if (names.length === 0) return null;

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
      <User className="h-2.5 w-2.5" />
      {names.join(", ")}
    </span>
  );
}

/* ─── Collapsible type detail ─── */
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

  const label = hasStages ? "Estágios" : hasChecklist ? "Checklist" : "Workstreams";

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {label}
      </button>
      {open && (
        <div className="mt-1.5">
          {hasStages && <StageGateDisplay config={kr.typeConfig as { stages: StageGateStage[] }} />}
          {hasChecklist && (
            <ChecklistDisplay
              config={kr.typeConfig as { categories: ChecklistCategory[]; evaluationFrequency: string }}
            />
          )}
          {hasWorkstreams && (
            <MultiPhaseDisplay
              config={kr.typeConfig as { workstreams: Workstream[]; criticalIncidents: CriticalIncident[]; maxTolerableIncidents: number }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible phasing chart ─── */
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
  const phasing = useQuery(api.phasing.getPhasing, { keyResultId: keyResult._id });

  if (phasing === undefined || phasing.length === 0) return null;

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Progresso planejado vs real
      </button>
      {open && (
        <PhasingChart keyResult={keyResult} cycleStartDate={cycleStartDate} cycleEndDate={cycleEndDate} />
      )}
    </div>
  );
}

/* ─── KR Card ─── */
function KrCard({
  kr,
  cycleStartDate,
  cycleEndDate,
  canShowPhasing,
  onDelete,
}: {
  kr: Doc<"keyResults"> & { health: HealthStatus };
  cycleStartDate?: string;
  cycleEndDate?: string;
  canShowPhasing: boolean;
  onDelete: (id: Id<"keyResults">) => Promise<void>;
}) {
  const krType = resolveKrType(kr);
  const typeConfig = resolveTypeConfig(kr);
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
    ((typeConfig as { stages?: StageGateStage[] })?.stages?.length ?? 0) > 0;
  const hasChecklist =
    krType === "CHECKLIST_COMPLIANCE" &&
    ((typeConfig as { categories?: ChecklistCategory[] })?.categories?.length ?? 0) > 0;
  const hasWorkstreams =
    krType === "MULTI_PHASE_WITH_RISK" &&
    ((typeConfig as { workstreams?: Workstream[] })?.workstreams?.length ?? 0) > 0;
  const needsConfig =
    (krType === "STAGE_GATE" && !hasStages) ||
    (krType === "CHECKLIST_COMPLIANCE" && !hasChecklist) ||
    (krType === "MULTI_PHASE_WITH_RISK" && !hasWorkstreams);

  return (
    <div className="bg-card rounded-lg border border-border/80 group hover:border-border transition-colors">
      {/* ─── Title row ─── */}
      <div className="px-3 pt-3 pb-1.5">
        <div className="flex items-start gap-2">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${healthColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
              {kr.title}
            </p>
            {kr.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{kr.description}</p>
            )}
            <ResponsiblesBadges responsibles={kr.responsibles as string[] | undefined} />
          </div>
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
        {hasWorkstreams && (
          <RiskBadge
            criticalIncidents={(typeConfig as { criticalIncidents?: CriticalIncident[] }).criticalIncidents ?? []}
            maxTolerableIncidents={(typeConfig as { maxTolerableIncidents?: number }).maxTolerableIncidents ?? 0}
          />
        )}
        <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
          {progress}%
        </span>
      </div>

      {/* ─── Progress bar ─── */}
      <div className="px-3 pb-2.5">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${kr.hasProgress ? healthColor : progress >= 100 ? "bg-success" : "bg-primary"
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

        {krType === "STAGE_GATE" && <StageGateConfigEditor keyResult={kr} />}
        {krType === "CHECKLIST_COMPLIANCE" && <ChecklistConfigEditor keyResult={kr} />}
        {krType === "MULTI_PHASE_WITH_RISK" && <MultiPhaseConfigEditor keyResult={kr} />}
        {canShowPhasing && supportsPhasing && cycleStartDate && cycleEndDate && (
          <PhasingEditor keyResult={kr} cycleStartDate={cycleStartDate} cycleEndDate={cycleEndDate} />
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
              <AlertDialogTitle>Excluir Key Result?</AlertDialogTitle>
              <AlertDialogDescription>
                {kr.hasProgress
                  ? "Atenção: este Key Result possui progresso registrado. Esta ação não pode ser desfeita e todos os dados serão perdidos."
                  : "Esta ação não pode ser desfeita."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(kr._id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ─── Config CTA ─── */}
      {needsConfig && (
        <div className="border-t border-dashed px-3 py-2 flex items-center gap-2 bg-muted/20">
          <p className="text-xs text-muted-foreground flex-1">
            {krType === "STAGE_GATE" && "Configure os estágios deste KR"}
            {krType === "CHECKLIST_COMPLIANCE" && "Configure o checklist deste KR"}
            {krType === "MULTI_PHASE_WITH_RISK" && "Configure os workstreams deste KR"}
          </p>
          {krType === "STAGE_GATE" && <StageGateConfigEditor keyResult={kr} />}
          {krType === "CHECKLIST_COMPLIANCE" && <ChecklistConfigEditor keyResult={kr} />}
          {krType === "MULTI_PHASE_WITH_RISK" && <MultiPhaseConfigEditor keyResult={kr} />}
        </div>
      )}

      {/* ─── Collapsible details ─── */}
      <div className="px-3 pb-2">
        {/* Checklist gets its own collapsible; stages/workstreams are shown via PhasingChart */}
        {hasChecklist && (
          <CollapsibleTypeDetail
            kr={kr}
            krType={krType}
            hasStages={false}
            hasChecklist={hasChecklist}
            hasWorkstreams={false}
          />
        )}
        {supportsPhasing && (
          <CollapsiblePhasingChart
            keyResult={kr}
            cycleStartDate={cycleStartDate}
            cycleEndDate={cycleEndDate}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

interface ObjectiveDetailProps {
  objectiveId: Id<"objectives">;
}

export function ObjectiveDetail({ objectiveId }: ObjectiveDetailProps) {
  const router = useRouter();
  const objective = useQuery(api.objectives.getObjective, { id: objectiveId });
  const cycle = useQuery(
    api.cycles.getCycle,
    objective?.cycleId ? { id: objective.cycleId } : "skip"
  );
  const franchise = useQuery(
    api.franchises.getFranchise,
    objective?.franchiseId ? { id: objective.franchiseId } : "skip"
  );
  const currentDate = getCurrentDate();
  const keyResults = useQuery(api.keyResults.getKeyResultsWithHealth, {
    objectiveId,
    currentDate,
  });
  const deleteObjective = useMutation(api.objectives.deleteObjective);
  const deleteKeyResult = useMutation(api.keyResults.deleteKeyResult);

  if (objective === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse bg-muted/50 rounded" />
        <div className="h-10 w-3/4 animate-pulse bg-muted/50 rounded" />
        <div className="h-2 w-full animate-pulse bg-muted/50 rounded-full" />
      </div>
    );
  }

  if (objective === null) {
    return (
      <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
        Objetivo não encontrado.
      </div>
    );
  }

  const hasProgress = keyResults?.some((kr) => kr.hasProgress) ?? false;

  const handleDeleteObjective = async () => {
    try {
      await deleteObjective({ id: objectiveId });
      toast.success("Objetivo excluído");
      router.push("/planejamento");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir objetivo"
      );
    }
  };

  const handleDeleteKr = async (krId: Id<"keyResults">) => {
    try {
      await deleteKeyResult({ id: krId });
      toast.success("Key Result excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir Key Result"
      );
    }
  };

  const statusColor =
    objective.status === "COMPLETED"
      ? "bg-success text-success-foreground"
      : objective.status === "AT_RISK"
        ? "bg-warning text-warning-foreground"
        : objective.status === "LATE"
          ? "bg-destructive text-destructive-foreground"
          : objective.status === "IN_PROGRESS"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground";

  const progressBarColor =
    objective.status === "COMPLETED"
      ? "bg-success"
      : objective.status === "LATE"
        ? "bg-destructive"
        : objective.status === "AT_RISK"
          ? "bg-warning"
          : objective.progress >= 100
            ? "bg-success"
            : "bg-primary";

  const canShowPhasing = cycle?.startDate && cycle?.endDate;

  return (
    <div className="space-y-5">
      {/* ─── Back link ─── */}
      <Link
        href="/planejamento"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para objetivos
      </Link>

      {/* ─── Header: title + status + progress inline ─── */}
      <div className="bg-card border rounded-lg p-4 group">
        <div className="flex items-start gap-3">
          {/* Left accent */}
          <div className={`w-1 self-stretch rounded-full shrink-0 ${progressBarColor}`} />

          <div className="flex-1 min-w-0">
            {/* Title + badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {objective.title}
              </h1>
              <Badge className={`shrink-0 ${statusColor} border-none text-xs px-1.5 py-0`}>
                {statusLabels[objective.status] ?? objective.status}
              </Badge>
            </div>

            {/* Description */}
            {objective.description && (
              <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
            )}

            {/* Franchise + Cycle */}
            {(cycle || franchise) && (
              <p className="text-sm text-muted-foreground mt-1">
                {franchise && <span>Franquia: {franchise.name}</span>}
                {franchise && cycle && <span> · </span>}
                {cycle && <span>Ciclo: {cycle.name}</span>}
              </p>
            )}

            {/* Progress inline */}
            <div className="flex items-center gap-3 mt-3">
              <Progress
                value={objective.progress}
                className="h-1.5 flex-1"
                indicatorClassName={progressBarColor}
              />
              <span className="text-sm font-semibold text-foreground tabular-nums w-8 text-right">
                {objective.progress}%
              </span>
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditObjectiveDialog objective={objective} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label="Excluir objetivo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir objetivo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {hasProgress
                      ? "Atenção: este objetivo possui Key Results com progresso registrado. Esta ação não pode ser desfeita e todos os dados de progresso serão perdidos."
                      : "Esta ação não pode ser desfeita. Todos os Key Results associados também serão excluídos."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteObjective}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* ─── Key Results ─── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Results
          </h2>
          <CreateKeyResultDialog objectiveId={objective._id} />
        </div>

        {keyResults === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-muted/50 rounded-lg border" />
            ))}
          </div>
        ) : keyResults.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
            Nenhum Key Result adicionado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {keyResults.map((kr) => (
              <KrCard
                key={kr._id}
                kr={kr}
                cycleStartDate={cycle?.startDate}
                cycleEndDate={cycle?.endDate}
                canShowPhasing={!!canShowPhasing}
                onDelete={handleDeleteKr}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
