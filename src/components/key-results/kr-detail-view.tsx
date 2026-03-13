"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { KrStatusBadge, HealthStatus } from "./kr-status-badge";
import { AddCommentForm } from "@/components/comments/add-comment-form";
import { CommentList } from "@/components/comments/comment-list";
import {
  Eye,
  Target,
  Check,
  Circle,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  type KrType,
  formatKrValue,
  calculateKrProgress,
  getKrTypeLabel,
} from "@/lib/kr-types";
import type {
  StageGateStage,
  ChecklistCategory,
  Workstream,
  WorkstreamPhase,
  CriticalIncident,
  StageStatus,
} from "@/lib/kr-types/types";

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

const stageStatusConfig: Record<
  StageStatus,
  { label: string; color: string; icon: typeof Circle }
> = {
  NOT_STARTED: {
    label: "Não iniciado",
    color: "bg-muted text-muted-foreground",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "Em andamento",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: Check,
  },
};

interface KrDetailViewProps {
  keyResult: Doc<"keyResults">;
  health: HealthStatus;
}

export function KrDetailView({ keyResult, health }: KrDetailViewProps) {
  const progressEntries = useQuery(api.progressEntries.getProgressEntries, {
    keyResultId: keyResult._id,
  });

  const krType = resolveKrType(keyResult);
  const typeConfig = resolveTypeConfig(keyResult);
  const isLegacyMilestone =
    keyResult.measurementType === "MILESTONE" && !keyResult.krType;

  const milestones = useQuery(
    api.milestones.getMilestones,
    isLegacyMilestone ? { keyResultId: keyResult._id } : "skip"
  );

  const progress = Math.round(
    calculateKrProgress({
      krType,
      currentValue: keyResult.currentValue,
      initialValue: keyResult.initialValue,
      targetValue: keyResult.targetValue,
      typeConfig,
    })
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Ver detalhes"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {keyResult.title}
            <KrStatusBadge health={health} size="default" />
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Tipo: {getKrTypeLabel(krType)}
          </p>
        </DialogHeader>
        <div className="space-y-6 py-2 max-h-[75vh] overflow-y-auto pr-1">
          {/* Progress overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Progresso Geral
              </span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>

            <Progress value={progress} className="h-3" />

            <div className="grid grid-cols-3 text-sm mt-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  Inicial
                </span>
                <span className="font-medium">
                  {formatKrValue(krType, keyResult.initialValue, typeConfig)}
                </span>
              </div>
              <div className="flex flex-col text-center border-x border-border/50">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  Atual
                </span>
                <span className="font-bold text-primary">
                  {formatKrValue(krType, keyResult.currentValue, typeConfig)}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  Meta
                </span>
                <span className="font-medium">
                  {formatKrValue(krType, keyResult.targetValue, typeConfig)}
                </span>
              </div>
            </div>
          </div>

          {/* Type-specific detail sections */}
          {krType === "STAGE_GATE" &&
            keyResult.typeConfig &&
            ((keyResult.typeConfig as { stages: StageGateStage[] }).stages
              ?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Estágios
                </h4>
                <div className="space-y-2 border rounded-md p-3">
                  {(
                    keyResult.typeConfig as { stages: StageGateStage[] }
                  ).stages.map((stage, index) => {
                    const {
                      label,
                      color,
                      icon: Icon,
                    } = stageStatusConfig[stage.status];
                    return (
                      <div
                        key={stage.id}
                        className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/20"
                      >
                        <span className="text-xs font-medium text-muted-foreground w-5">
                          {index + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{stage.name}</div>
                          {stage.description && (
                            <div className="text-xs text-muted-foreground">
                              {stage.description}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] shrink-0 ${color}`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {label}
                        </Badge>
                        {stage.completedAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(
                              new Date(stage.completedAt),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {krType === "CHECKLIST_COMPLIANCE" &&
            keyResult.typeConfig &&
            ((
              keyResult.typeConfig as { categories: ChecklistCategory[] }
            ).categories?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">
                  Checklist de Compliance
                </h4>
                {(
                  keyResult.typeConfig as {
                    categories: ChecklistCategory[];
                  }
                ).categories.map((cat) => {
                  const catTotal = cat.items.length;
                  const catCompliant = cat.items.filter(
                    (i) => i.compliant
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="border rounded-md p-3 space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">
                          {catCompliant}/{catTotal}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 text-sm p-1.5 rounded ${
                              item.compliant
                                ? "text-muted-foreground bg-green-50 dark:bg-green-950/20"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                item.compliant
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-muted-foreground/30"
                              }`}
                            >
                              {item.compliant && (
                                <Check className="h-2.5 w-2.5 text-green-500" />
                              )}
                            </div>
                            <span
                              className={
                                item.compliant ? "line-through" : ""
                              }
                            >
                              {item.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {krType === "MULTI_PHASE_WITH_RISK" && keyResult.typeConfig && (
            <div className="space-y-3">
              {/* Workstreams */}
              {((keyResult.typeConfig as { workstreams: Workstream[] })
                .workstreams?.length ?? 0) > 0 && (
                <>
                  <h4 className="text-sm font-semibold">Workstreams</h4>
                  {(
                    keyResult.typeConfig as { workstreams: Workstream[] }
                  ).workstreams.map((ws) => {
                    const completed = ws.phases.filter(
                      (p: WorkstreamPhase) => p.status === "COMPLETED"
                    ).length;
                    return (
                      <div
                        key={ws.id}
                        className="border rounded-md p-3 space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{ws.name}</span>
                          <span className="text-muted-foreground">
                            {completed}/{ws.phases.length} fases | peso:{" "}
                            {Math.round(ws.weight * 100)}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          {ws.phases.map((phase: WorkstreamPhase) => {
                            const {
                              label,
                              color,
                              icon: Icon,
                            } = stageStatusConfig[phase.status];
                            return (
                              <div
                                key={phase.id}
                                className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/20"
                              >
                                <div className="flex-1">{phase.name}</div>
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] ${color}`}
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {label}
                                </Badge>
                                {phase.completedAt && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {format(
                                      new Date(phase.completedAt),
                                      "dd/MM/yyyy",
                                      { locale: ptBR }
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Incidents */}
              {((
                keyResult.typeConfig as {
                  criticalIncidents: CriticalIncident[];
                }
              ).criticalIncidents?.length ?? 0) > 0 && (
                <>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    Incidentes
                  </h4>
                  <div className="space-y-1 border rounded-md p-3">
                    {(
                      keyResult.typeConfig as {
                        criticalIncidents: CriticalIncident[];
                      }
                    ).criticalIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className={`flex items-center gap-2 text-sm p-2 rounded ${
                          incident.resolved ? "opacity-50" : ""
                        }`}
                      >
                        {incident.resolved ? (
                          <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span
                          className={`flex-1 ${incident.resolved ? "line-through" : ""}`}
                        >
                          {incident.description}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          {incident.severity}
                        </Badge>
                        {incident.occurredAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(
                              new Date(incident.occurredAt),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Legacy Milestones (backward compat) */}
          {isLegacyMilestone &&
            milestones &&
            milestones.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Marcos
                </h4>
                <div className="space-y-2 border rounded-md p-3">
                  {milestones.map((m) => (
                    <div
                      key={m._id}
                      className={`flex items-center gap-3 text-sm p-2 rounded-md transition-colors ${
                        m.completed
                          ? "bg-muted/50 text-muted-foreground"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          m.completed
                            ? "border-success bg-success/10 text-success"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {m.completed && (
                          <div className="w-2.5 h-2.5 rounded-full bg-success" />
                        )}
                      </div>
                      <span
                        className={
                          m.completed
                            ? "line-through decoration-muted-foreground/50"
                            : ""
                        }
                      >
                        {m.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Progress history */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">
              Histórico de Atualizações
            </h4>
            {progressEntries === undefined ? (
              <div className="text-sm text-muted-foreground animate-pulse">
                Carregando...
              </div>
            ) : progressEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md text-center">
                Nenhuma atualização registrada.
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {progressEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex justify-between items-center text-sm py-2 px-3 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <span className="font-medium">
                      {formatKrValue(krType, entry.value, typeConfig)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(entry.recordedAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Last update */}
          {keyResult.updatedAt && (
            <div className="text-xs text-muted-foreground">
              Última atualização:{" "}
              {format(
                new Date(keyResult.updatedAt),
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}
            </div>
          )}

          {/* Comments section */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold">Comentários</h4>
            <div className="bg-muted/20 rounded-lg p-4 border">
              <AddCommentForm keyResultId={keyResult._id} />
              <div className="mt-4">
                <CommentList keyResultId={keyResult._id} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
