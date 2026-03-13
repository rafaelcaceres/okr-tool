"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Check,
  Circle,
  Loader2,
  AlertTriangle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Workstream,
  WorkstreamPhase,
  CriticalIncident,
  StageStatus,
  IncidentSeverity,
} from "@/lib/kr-types/types";

const statusConfig: Record<StageStatus, { label: string; color: string; icon: typeof Circle }> = {
  NOT_STARTED: { label: "Não iniciado", color: "bg-muted text-muted-foreground", icon: Circle },
  IN_PROGRESS: { label: "Em andamento", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Loader2 },
  COMPLETED: { label: "Concluído", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: Check },
};

const severityLabels: Record<IncidentSeverity, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const severityColors: Record<IncidentSeverity, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function getNextStatus(current: StageStatus): StageStatus | null {
  if (current === "NOT_STARTED") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "COMPLETED";
  return null;
}

interface MultiPhaseConfig {
  workstreams: Workstream[];
  phaseWeight: number;
  riskWeight: number;
  criticalIncidents: CriticalIncident[];
  maxTolerableIncidents: number;
}

interface MultiPhaseProgressPanelProps {
  keyResult: Doc<"keyResults">;
}

export function MultiPhaseProgressPanel({ keyResult }: MultiPhaseProgressPanelProps) {
  const updatePhaseStatus = useMutation(api.keyResults.updateWorkstreamPhaseStatus);
  const addIncident = useMutation(api.keyResults.addCriticalIncident);
  const resolveIncidentMutation = useMutation(api.keyResults.resolveIncident);

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>("MEDIUM");

  const config = (keyResult.typeConfig ?? {
    workstreams: [],
    phaseWeight: 0.7,
    riskWeight: 0.3,
    criticalIncidents: [],
    maxTolerableIncidents: 0,
  }) as MultiPhaseConfig;

  const { workstreams, criticalIncidents, maxTolerableIncidents } = config;
  const unresolvedCritical = criticalIncidents.filter(
    (i) => i.severity === "CRITICAL" && !i.resolved
  ).length;

  const handlePhaseTransition = async (
    workstreamId: string,
    phaseId: string,
    newStatus: StageStatus
  ) => {
    try {
      await updatePhaseStatus({
        id: keyResult._id,
        workstreamId,
        phaseId,
        status: newStatus,
      });
      toast.success("Fase atualizada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar fase"
      );
    }
  };

  const handleAddIncident = async () => {
    if (!incidentDesc.trim()) {
      toast.error("Descrição é obrigatória.");
      return;
    }
    try {
      await addIncident({
        id: keyResult._id,
        incidentId: crypto.randomUUID(),
        description: incidentDesc.trim(),
        severity: incidentSeverity,
      });
      toast.success("Incidente registrado");
      setIncidentDesc("");
      setShowIncidentForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar incidente"
      );
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      await resolveIncidentMutation({
        id: keyResult._id,
        incidentId,
      });
      toast.success("Incidente resolvido");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao resolver incidente"
      );
    }
  };

  if (workstreams.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
        Nenhum workstream configurado. Use o botão de configuração para adicionar workstreams e fases.
      </p>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {/* Risk status summary */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
        <div className="flex items-center gap-2">
          {unresolvedCritical > maxTolerableIncidents ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm text-muted-foreground">
            Incidentes críticos não resolvidos:
          </span>
          <span className="font-bold">{unresolvedCritical}</span>
          <span className="text-xs text-muted-foreground">
            (máx. tolerável: {maxTolerableIncidents})
          </span>
        </div>
      </div>

      {/* Workstreams */}
      {workstreams.map((ws) => {
        const completedPhases = ws.phases.filter(
          (p: WorkstreamPhase) => p.status === "COMPLETED"
        ).length;
        return (
          <div key={ws.id} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{ws.name}</h4>
              <span className="text-xs text-muted-foreground">
                {completedPhases}/{ws.phases.length} fases | peso: {Math.round(ws.weight * 100)}%
              </span>
            </div>
            <div className="space-y-1">
              {ws.phases.map((phase: WorkstreamPhase) => {
                const { label, color, icon: Icon } = statusConfig[phase.status];
                const nextStatus = getNextStatus(phase.status);
                return (
                  <div
                    key={phase.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/20"
                  >
                    <div className="flex-1 text-sm truncate">{phase.name}</div>
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${color}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </Badge>
                    {nextStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] shrink-0"
                        onClick={() => handlePhaseTransition(ws.id, phase.id, nextStatus)}
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
      })}

      <Separator />

      {/* Incidents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Incidentes</h4>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowIncidentForm(!showIncidentForm)}
          >
            <Plus className="h-3 w-3 mr-1" /> Registrar
          </Button>
        </div>

        {showIncidentForm && (
          <div className="space-y-2 p-3 border rounded-md bg-muted/20">
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                placeholder="Descreva o incidente"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs">Severidade</Label>
                <Select
                  value={incidentSeverity}
                  onValueChange={(v) => setIncidentSeverity(v as IncidentSeverity)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="CRITICAL">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="h-8 mt-4"
                onClick={handleAddIncident}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {criticalIncidents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-2">
            Nenhum incidente registrado.
          </p>
        ) : (
          <div className="space-y-1">
            {criticalIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                  incident.resolved ? "bg-muted/30 opacity-60" : "bg-muted/20"
                }`}
              >
                <Badge
                  variant="secondary"
                  className={`text-[10px] shrink-0 ${severityColors[incident.severity]}`}
                >
                  {severityLabels[incident.severity]}
                </Badge>
                <span
                  className={`flex-1 truncate ${incident.resolved ? "line-through" : ""}`}
                >
                  {incident.description}
                </span>
                {!incident.resolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] shrink-0"
                    onClick={() => handleResolveIncident(incident.id)}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
