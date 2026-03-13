"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KeyResultList } from "@/components/key-results/key-result-list";
import { CreateKeyResultDialog } from "@/components/key-results/create-key-result-dialog";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Não Iniciado",
  IN_PROGRESS: "Em Progresso",
  COMPLETED: "Concluído",
  AT_RISK: "Em Risco",
  LATE: "Atrasado",
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-success text-success-foreground hover:bg-success/90";
    case "AT_RISK":
      return "bg-warning text-warning-foreground hover:bg-warning/90";
    case "LATE":
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    case "IN_PROGRESS":
      return "bg-primary text-primary-foreground hover:bg-primary/90";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted/90";
  }
};

const getProgressIndicatorClass = (status: string, progress: number) => {
  if (status === "COMPLETED" || progress >= 100) return "bg-success";
  if (status === "LATE") return "bg-destructive";
  if (status === "AT_RISK") return "bg-warning";
  return "bg-primary";
};

interface ObjectiveListProps {
  cycleId?: Id<"cycles">;
  franchiseId?: Id<"franchises">;
}

export function ObjectiveList({ cycleId, franchiseId }: ObjectiveListProps) {
  const objectives = useQuery(api.objectives.getObjectives, {
    cycleId,
    franchiseId,
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const cycles = useQuery(api.cycles.getCycles);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (objectives === undefined) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse bg-muted/50 rounded-lg border"
          />
        ))}
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground">
          Nenhum objetivo encontrado
        </h3>
        <p className="text-muted-foreground mt-1">
          Crie um objetivo para começar a acompanhar suas metas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {objectives.map((objective: Doc<"objectives">) => {
        const statusClass = getStatusColorClass(objective.status);
        const progressIndicator = getProgressIndicatorClass(
          objective.status,
          objective.progress
        );
        const isExpanded = expandedIds.has(objective._id);

        // Find the cycle for this objective to get start/end dates
        const cycle = cycles?.find((c) => c._id === objective.cycleId);

        return (
          <div
            key={objective._id}
            className="bg-card border rounded-lg overflow-hidden group"
          >
            {/* Objective row */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Expand/collapse button */}
              <button
                type="button"
                onClick={() => toggleExpanded(objective._id)}
                className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isExpanded ? "Recolher" : "Expandir"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Left accent bar */}
              <div
                className={`w-0.5 self-stretch rounded-full shrink-0 ${progressIndicator}`}
              />

              {/* Title + badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/planejamento/objetivos/${objective._id}`}
                    className="text-base font-semibold text-foreground hover:text-primary transition-colors truncate"
                  >
                    {objective.title}
                  </Link>
                  <Badge className={`shrink-0 ${statusClass} border-none text-xs px-1.5 py-0`}>
                    {statusLabels[objective.status] ?? objective.status}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="shrink-0 flex items-center gap-2 w-36">
                <Progress
                  value={objective.progress}
                  className="h-1.5 bg-muted flex-1"
                  indicatorClassName={progressIndicator}
                />
                <span className="text-sm font-medium text-foreground w-8 text-right tabular-nums">
                  {objective.progress}%
                </span>
              </div>

              {/* Link to detail page — visible on hover */}
              <Link
                href={`/planejamento/objetivos/${objective._id}`}
                className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                title="Abrir detalhes"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Expanded KRs */}
            {isExpanded && (
              <div className="border-t bg-muted/20 px-3 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Results
                  </h3>
                  <CreateKeyResultDialog objectiveId={objective._id} />
                </div>
                <KeyResultList
                  objectiveId={objective._id}
                  cycleStartDate={cycle?.startDate}
                  cycleEndDate={cycle?.endDate}
                  cycleStatus={cycle?.status}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
