import type { StageGateStage, StageStatus } from "@/lib/kr-types/types";
import { Check, Circle, Loader2 } from "lucide-react";

const statusStyles: Record<StageStatus, { bg: string; border: string; icon: typeof Circle | null }> = {
  NOT_STARTED: { bg: "bg-muted", border: "border-muted-foreground/30", icon: null },
  IN_PROGRESS: { bg: "bg-blue-500", border: "border-blue-500", icon: Loader2 },
  COMPLETED: { bg: "bg-green-500", border: "border-green-500", icon: Check },
};

interface StageGateDisplayProps {
  config: { stages: StageGateStage[] };
}

export function StageGateDisplay({ config }: StageGateDisplayProps) {
  const { stages } = config;
  if (stages.length === 0) return null;

  const completed = stages.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Estágios
        </h4>
        <span className="text-[10px] text-muted-foreground">
          {completed} de {stages.length} concluídos
        </span>
      </div>
      <div className="flex items-center gap-1">
        {stages.map((stage, index) => {
          const { bg, border } = statusStyles[stage.status];
          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 ${border} ${bg} flex items-center justify-center shrink-0`}
                  title={`${stage.name}: ${stage.status}`}
                >
                  {stage.status === "COMPLETED" && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                  {stage.status === "IN_PROGRESS" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 truncate max-w-full text-center">
                  {stage.name}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`h-0.5 w-3 shrink-0 -mt-3 ${
                    stage.status === "COMPLETED" ? "bg-green-500" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
