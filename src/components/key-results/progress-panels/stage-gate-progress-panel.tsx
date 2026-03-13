"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { StageGateStage, StageStatus } from "@/lib/kr-types/types";

const statusConfig: Record<StageStatus, { label: string; color: string; icon: typeof Circle }> = {
  NOT_STARTED: { label: "Não iniciado", color: "bg-muted text-muted-foreground", icon: Circle },
  IN_PROGRESS: { label: "Em andamento", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Loader2 },
  COMPLETED: { label: "Concluído", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: Check },
};

function getNextStatus(current: StageStatus): StageStatus | null {
  if (current === "NOT_STARTED") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "COMPLETED";
  return null;
}

interface StageGateProgressPanelProps {
  keyResult: Doc<"keyResults">;
}

export function StageGateProgressPanel({ keyResult }: StageGateProgressPanelProps) {
  const updateStageStatus = useMutation(api.keyResults.updateStageStatus);
  const config = (keyResult.typeConfig ?? { stages: [] }) as { stages: StageGateStage[] };
  const stages = config.stages;

  const handleTransition = async (stageId: string, newStatus: StageStatus) => {
    try {
      await updateStageStatus({
        id: keyResult._id,
        stageId,
        status: newStatus,
      });
      toast.success("Estágio atualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar estágio"
      );
    }
  };

  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
        Nenhum estágio configurado. Use o botão de configuração para adicionar estágios.
      </p>
    );
  }

  const completed = stages.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{completed}</span> de{" "}
        <span className="font-medium text-foreground">{stages.length}</span> estágios concluídos
      </div>
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const { label, color, icon: Icon } = statusConfig[stage.status];
          const nextStatus = getNextStatus(stage.status);

          // Check sequential dependency: can only advance if all previous stages are completed
          const canAdvance =
            nextStatus !== null &&
            stages.slice(0, index).every((s) => s.status === "COMPLETED");

          return (
            <div
              key={stage.id}
              className="flex items-center gap-3 p-3 border rounded-md bg-muted/20"
            >
              <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{stage.name}</div>
                {stage.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {stage.description}
                  </div>
                )}
              </div>
              <Badge variant="secondary" className={`text-[10px] shrink-0 ${color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Badge>
              {canAdvance && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => handleTransition(stage.id, nextStatus)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  {nextStatus === "IN_PROGRESS" ? "Iniciar" : "Concluir"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
