"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Workstream, WorkstreamPhase } from "@/lib/kr-types/types";

interface MultiPhaseConfig {
  workstreams: Workstream[];
  phaseWeight: number;
  riskWeight: number;
  criticalIncidents: unknown[];
  maxTolerableIncidents: number;
}

interface MultiPhaseConfigEditorProps {
  keyResult: Doc<"keyResults">;
}

export function MultiPhaseConfigEditor({ keyResult }: MultiPhaseConfigEditorProps) {
  const [open, setOpen] = useState(false);
  const updateKeyResult = useMutation(api.keyResults.updateKeyResult);

  const defaultConfig: MultiPhaseConfig = {
    workstreams: [],
    phaseWeight: 0.7,
    riskWeight: 0.3,
    criticalIncidents: [],
    maxTolerableIncidents: 0,
  };

  const config = (keyResult.typeConfig ?? defaultConfig) as MultiPhaseConfig;

  const [workstreams, setWorkstreams] = useState<Workstream[]>(config.workstreams);
  const [phaseWeight, setPhaseWeight] = useState(config.phaseWeight);
  const [maxTolerable, setMaxTolerable] = useState(config.maxTolerableIncidents);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      const c = (keyResult.typeConfig ?? defaultConfig) as MultiPhaseConfig;
      setWorkstreams(c.workstreams);
      setPhaseWeight(c.phaseWeight);
      setMaxTolerable(c.maxTolerableIncidents);
    }
    setOpen(isOpen);
  };

  const addWorkstream = () => {
    setWorkstreams([
      ...workstreams,
      {
        id: crypto.randomUUID(),
        name: "",
        weight: 0,
        phases: [],
      },
    ]);
  };

  const removeWorkstream = (id: string) => {
    setWorkstreams(workstreams.filter((ws) => ws.id !== id));
  };

  const updateWorkstreamName = (id: string, name: string) => {
    setWorkstreams(workstreams.map((ws) => (ws.id === id ? { ...ws, name } : ws)));
  };

  const updateWorkstreamWeight = (id: string, weight: number) => {
    setWorkstreams(workstreams.map((ws) => (ws.id === id ? { ...ws, weight } : ws)));
  };

  const addPhase = (workstreamId: string) => {
    setWorkstreams(
      workstreams.map((ws) =>
        ws.id === workstreamId
          ? {
              ...ws,
              phases: [
                ...ws.phases,
                {
                  id: crypto.randomUUID(),
                  name: "",
                  status: "NOT_STARTED" as const,
                },
              ],
            }
          : ws
      )
    );
  };

  const removePhase = (workstreamId: string, phaseId: string) => {
    setWorkstreams(
      workstreams.map((ws) =>
        ws.id === workstreamId
          ? { ...ws, phases: ws.phases.filter((p: WorkstreamPhase) => p.id !== phaseId) }
          : ws
      )
    );
  };

  const updatePhaseName = (workstreamId: string, phaseId: string, name: string) => {
    setWorkstreams(
      workstreams.map((ws) =>
        ws.id === workstreamId
          ? {
              ...ws,
              phases: ws.phases.map((p: WorkstreamPhase) =>
                p.id === phaseId ? { ...p, name } : p
              ),
            }
          : ws
      )
    );
  };

  const handleSave = async () => {
    const validWorkstreams = workstreams
      .filter((ws) => ws.name.trim() !== "")
      .map((ws) => ({
        ...ws,
        phases: ws.phases.filter((p: WorkstreamPhase) => p.name.trim() !== ""),
      }));

    if (validWorkstreams.length === 0) {
      toast.error("Adicione ao menos um workstream com nome.");
      return;
    }

    const hasEmptyWorkstream = validWorkstreams.some((ws) => ws.phases.length === 0);
    if (hasEmptyWorkstream) {
      toast.error("Cada workstream deve ter ao menos uma fase.");
      return;
    }

    const totalWeight = validWorkstreams.reduce((sum, ws) => sum + ws.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      toast.error("A soma dos pesos dos workstreams deve ser 1.0.");
      return;
    }

    try {
      await updateKeyResult({
        id: keyResult._id,
        typeConfig: {
          workstreams: validWorkstreams,
          phaseWeight,
          riskWeight: Math.round((1 - phaseWeight) * 100) / 100,
          criticalIncidents: config.criticalIncidents ?? [],
          maxTolerableIncidents: maxTolerable,
        },
      });
      toast.success("Configuração salva com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar configuração"
      );
    }
  };

  const riskWeight = Math.round((1 - phaseWeight) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Configurar workstreams e fases"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Configurar Multifase com Risco</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Weights */}
          <div className="space-y-3 p-3 border rounded-md bg-muted/20">
            <div className="flex justify-between text-sm">
              <span>Peso Fases: <strong>{Math.round(phaseWeight * 100)}%</strong></span>
              <span>Peso Risco: <strong>{Math.round(riskWeight * 100)}%</strong></span>
            </div>
            <Slider
              value={[phaseWeight * 100]}
              onValueChange={([v]) => setPhaseWeight(Math.round(v) / 100)}
              min={10}
              max={90}
              step={5}
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Máx. incidentes toleráveis:
              </Label>
              <Input
                type="number"
                min={0}
                value={maxTolerable}
                onChange={(e) => setMaxTolerable(Math.max(0, Number(e.target.value)))}
                className="h-7 w-20 text-sm"
              />
            </div>
          </div>

          {/* Workstreams */}
          {workstreams.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
              Nenhum workstream adicionado. Clique em &quot;Adicionar Workstream&quot; para começar.
            </p>
          )}

          {workstreams.map((ws) => (
            <div key={ws.id} className="border rounded-md p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={ws.name}
                  onChange={(e) => updateWorkstreamName(ws.id, e.target.value)}
                  placeholder="Nome do workstream"
                  className="h-8 text-sm font-medium flex-1"
                />
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Peso:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={ws.weight}
                    onChange={(e) => updateWorkstreamWeight(ws.id, Number(e.target.value))}
                    className="h-8 w-20 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeWorkstream(ws.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="pl-3 space-y-2 border-l-2 border-muted">
                {ws.phases.map((phase: WorkstreamPhase) => (
                  <div key={phase.id} className="flex items-center gap-2">
                    <Input
                      value={phase.name}
                      onChange={(e) => updatePhaseName(ws.id, phase.id, e.target.value)}
                      placeholder="Nome da fase"
                      className="h-7 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removePhase(ws.id, phase.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => addPhase(ws.id)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Adicionar Fase
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addWorkstream}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Workstream
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
