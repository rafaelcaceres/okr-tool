"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { UpdateProgressDialog } from "./update-progress-dialog";
import { EditKeyResultDialog } from "./edit-key-result-dialog";
import { KrDetailView } from "./kr-detail-view";
import { KrStatusBadge, HealthStatus } from "./kr-status-badge";
import { PhasingEditor } from "../phasing/phasing-editor";
import { PhasingChart } from "../phasing/phasing-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { ExternalLink, MessageCircle, Trash2, TrendingDown, Target } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getKrTypeLabel } from "@/lib/kr-types";
import { resolveKr, formatResolvedValue } from "@/lib/kr-types/resolve";
import { StageGateConfigEditor } from "./type-config/stage-gate-config-editor";
import { ChecklistConfigEditor } from "./type-config/checklist-config-editor";
import { MultiPhaseConfigEditor } from "./type-config/multi-phase-config-editor";
import { TypeConfigSection } from "./type-config-section";

interface KeyResultCardProps {
  keyResult: Doc<"keyResults"> & { health: HealthStatus };
  cycleStartDate?: string;
  cycleEndDate?: string;
  cycleStatus?: string;
}

export function KeyResultCard({
  keyResult: kr,
  cycleStartDate,
  cycleEndDate,
  cycleStatus,
}: KeyResultCardProps) {
  const deleteKeyResult = useMutation(api.keyResults.deleteKeyResult);
  const progressEntries = useQuery(api.progressEntries.getProgressEntries, {
    keyResultId: kr._id,
  });

  const { krType, typeConfig, strategy, progress, isDecreasing } = resolveKr(kr);

  // Legacy milestone support
  const isMilestoneType = kr.measurementType === "MILESTONE" || krType === "STAGE_GATE";
  const milestones = useQuery(
    api.milestones.getMilestones,
    isMilestoneType && !kr.typeConfig ? { keyResultId: kr._id } : "skip"
  );

  const commentCount = useQuery(api.comments.getCommentCount, {
    keyResultId: kr._id,
  });

  const supportsPhasing = strategy.supportsPhasing && krType !== "STAGE_GATE";
  const canShowPhasing = cycleStartDate && cycleEndDate;

  const handleDelete = async () => {
    try {
      await deleteKeyResult({ id: kr._id });
      toast.success("Key Result excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir Key Result"
      );
    }
  };

  const recentEntries = progressEntries?.slice(0, 50) ?? [];

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base leading-none">{kr.title}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                {getKrTypeLabel(krType)}
              </Badge>
              {isDecreasing && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1 font-normal">
                  <TrendingDown className="h-3 w-3" /> Decrescente
                </Badge>
              )}
              <KrStatusBadge health={kr.health} size="sm" />
              {commentCount !== undefined && commentCount > 0 && (
                <Badge variant="ghost" className="text-[10px] px-1.5 py-0 h-5 gap-1 text-muted-foreground hover:bg-muted">
                  <MessageCircle className="h-3 w-3" />
                  {commentCount}
                </Badge>
              )}
            </div>
            {kr.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{kr.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {kr.externalLink && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                <a
                  href={kr.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir link externo"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            <KrDetailView keyResult={kr} health={kr.health} />

            <UpdateProgressDialog keyResult={kr} />

            {krType === "STAGE_GATE" && <StageGateConfigEditor keyResult={kr} />}
            {krType === "CHECKLIST_COMPLIANCE" && <ChecklistConfigEditor keyResult={kr} />}
            {krType === "MULTI_PHASE_WITH_RISK" && <MultiPhaseConfigEditor keyResult={kr} />}

            {canShowPhasing && supportsPhasing && (
              <PhasingEditor
                keyResult={kr}
                cycleStartDate={cycleStartDate}
                cycleEndDate={cycleEndDate}
              />
            )}

            <EditKeyResultDialog keyResult={kr} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label="Excluir Key Result"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Key Result?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {kr.hasProgress
                      ? "Atenção: este Key Result possui progresso registrado. Esta ação não pode ser desfeita e todos os dados de progresso serão perdidos."
                      : "Esta ação não pode ser desfeita. O Key Result será removido permanentemente."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Inicial</span>
              <span className="font-medium">{formatResolvedValue(kr, kr.initialValue)}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Atual</span>
              <span className="font-bold text-primary">{formatResolvedValue(kr, kr.currentValue)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Meta</span>
              <span className="font-medium">{formatResolvedValue(kr, kr.targetValue)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground font-medium">{progress}% Concluído</span>
            </div>
          </div>
        </div>

        {/* Type-specific config CTA or display */}
        <TypeConfigSection krType={krType} typeConfig={typeConfig} keyResult={kr} />

        {/* Legacy Milestones (for backward compat with MILESTONE type) */}
        {isMilestoneType && milestones && milestones.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Target className="h-3 w-3" /> Marcos
              </h4>
              <div className="space-y-1.5">
                {milestones.map((m) => (
                  <div
                    key={m._id}
                    className={`flex items-center gap-2 text-sm ${m.completed ? "text-muted-foreground" : ""}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        m.completed
                          ? "border-success bg-success/10 text-success"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {m.completed && (
                        <div className="w-2 h-2 rounded-full bg-success" />
                      )}
                    </div>
                    <span className={m.completed ? "line-through decoration-muted-foreground/50" : ""}>
                      {m.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Phasing chart */}
        {supportsPhasing && (
          <div className="mt-auto pt-2">
            <PhasingChart keyResult={kr} cycleStartDate={cycleStartDate} cycleEndDate={cycleEndDate} />
          </div>
        )}

        {/* Recent progress history */}
        {recentEntries.length > 0 && (
          <>
            <Separator className="my-1" />
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Atualizações Recentes
              </h4>
              <div className="space-y-1 h-[100px] overflow-y-auto pr-1">
                {recentEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex justify-between items-center text-xs py-1 px-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">
                      {formatResolvedValue(kr, entry.value)}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(entry.recordedAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
