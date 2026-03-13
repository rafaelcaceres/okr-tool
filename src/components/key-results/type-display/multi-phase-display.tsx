import type { Workstream, CriticalIncident, WorkstreamPhase } from "@/lib/kr-types/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MultiPhaseDisplayProps {
  config: {
    workstreams: Workstream[];
    criticalIncidents: CriticalIncident[];
    maxTolerableIncidents: number;
  };
}

export function RiskBadge({
  criticalIncidents,
  maxTolerableIncidents,
}: {
  criticalIncidents: CriticalIncident[];
  maxTolerableIncidents: number;
}) {
  const unresolvedCritical = criticalIncidents.filter(
    (i) => i.severity === "CRITICAL" && !i.resolved
  ).length;
  const unresolvedTotal = criticalIncidents.filter((i) => !i.resolved).length;

  const riskStatus: "green" | "yellow" | "red" =
    unresolvedCritical > maxTolerableIncidents
      ? "red"
      : unresolvedCritical > 0
        ? "yellow"
        : "green";

  const riskLabel = {
    green: "Verde",
    yellow: "Amarelo",
    red: "Vermelho",
  };

  const riskVariant = {
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  const Icon = riskStatus === "green" ? ShieldCheck : ShieldAlert;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${riskVariant[riskStatus]}`}
          >
            <Icon className="h-3 w-3" />
            Risco {riskLabel[riskStatus]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{unresolvedTotal} incidente{unresolvedTotal !== 1 ? "s" : ""} não resolvido{unresolvedTotal !== 1 ? "s" : ""}</p>
          <p>{unresolvedCritical} crítico{unresolvedCritical !== 1 ? "s" : ""} (tolerável: {maxTolerableIncidents})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MultiPhaseDisplay({ config }: MultiPhaseDisplayProps) {
  const { workstreams, criticalIncidents, maxTolerableIncidents } = config;
  if (workstreams.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workstreams
        </h4>
        <RiskBadge
          criticalIncidents={criticalIncidents}
          maxTolerableIncidents={maxTolerableIncidents}
        />
      </div>
      <div className="space-y-1.5">
        {workstreams.map((ws) => {
          const total = ws.phases.length;
          const completed = ws.phases.filter(
            (p: WorkstreamPhase) => p.status === "COMPLETED"
          ).length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={ws.id} className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground truncate">{ws.name}</span>
                <span className="font-medium shrink-0 ml-2">
                  {completed}/{total} fases
                </span>
              </div>
              <Progress value={rate} className="h-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
