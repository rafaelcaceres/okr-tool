"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";
import { type KrType } from "@/lib/kr-types";
import { NumericProgressPanel } from "./progress-panels/numeric-progress-panel";
import { PercentageProgressPanel } from "./progress-panels/percentage-progress-panel";
import { StageGateProgressPanel } from "./progress-panels/stage-gate-progress-panel";
import { ChecklistProgressPanel } from "./progress-panels/checklist-progress-panel";
import { MultiPhaseProgressPanel } from "./progress-panels/multi-phase-progress-panel";

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

interface UpdateProgressDialogProps {
  keyResult: Doc<"keyResults">;
}

export function UpdateProgressDialog({ keyResult }: UpdateProgressDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number>(keyResult.currentValue);
  const updateProgress = useMutation(api.keyResults.updateKeyResultProgress);

  // Legacy milestone support
  const isLegacyMilestone =
    keyResult.measurementType === "MILESTONE" && !keyResult.krType;
  const toggleMilestone = useMutation(api.milestones.toggleMilestone);
  const milestones = useQuery(
    api.milestones.getMilestones,
    isLegacyMilestone ? { keyResultId: keyResult._id } : "skip"
  );

  const krType = resolveKrType(keyResult);

  // Structured types save per-interaction, no bulk save needed
  const isStructuredType =
    krType === "STAGE_GATE" ||
    krType === "CHECKLIST_COMPLIANCE" ||
    krType === "MULTI_PHASE_WITH_RISK";

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setValue(keyResult.currentValue);
    }
    setOpen(isOpen);
  };

  const handleSubmit = async () => {
    try {
      await updateProgress({ id: keyResult._id, currentValue: value });
      toast.success("Progresso atualizado");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar progresso"
      );
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await toggleMilestone({ id: milestoneId as any });
      toast.success("Marco atualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar marco"
      );
    }
  };

  const renderPanel = () => {
    // Legacy milestone KRs (no krType field, using milestones table)
    if (isLegacyMilestone) {
      return (
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-primary font-semibold">
            <Target className="h-4 w-4" /> Marcos
          </Label>
          {milestones === undefined ? (
            <div className="text-sm text-muted-foreground animate-pulse">
              Carregando...
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-md text-center">
              Nenhum marco adicionado.
            </div>
          ) : (
            <div className="space-y-2 border rounded-md p-2">
              {milestones.map((m) => (
                <div
                  key={m._id}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    m.completed ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <Checkbox
                    id={m._id}
                    checked={m.completed}
                    onCheckedChange={() => handleToggleMilestone(m._id)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <label
                    htmlFor={m._id}
                    className={`text-sm font-medium cursor-pointer flex-1 ${
                      m.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {m.description}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    switch (krType) {
      case "STAGE_GATE":
        return <StageGateProgressPanel keyResult={keyResult} />;
      case "CHECKLIST_COMPLIANCE":
        return <ChecklistProgressPanel keyResult={keyResult} />;
      case "MULTI_PHASE_WITH_RISK":
        return <MultiPhaseProgressPanel keyResult={keyResult} />;
      case "PROGRESSIVE_PERCENTAGE":
        return (
          <PercentageProgressPanel
            keyResult={keyResult}
            value={value}
            onChange={setValue}
          />
        );
      case "CUMULATIVE_NUMERIC":
      case "PERIODIC_INDEX":
      default:
        return (
          <NumericProgressPanel
            keyResult={keyResult}
            krType={krType}
            value={value}
            onChange={setValue}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Atualizar progresso"
        >
          <TrendingUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={isStructuredType ? "sm:max-w-[600px]" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Atualizar Progresso
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-md border">
            {keyResult.title}
          </div>
          {renderPanel()}
        </div>

        {!isStructuredType && !isLegacyMilestone && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
