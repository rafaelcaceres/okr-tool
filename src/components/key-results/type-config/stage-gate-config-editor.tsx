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
import { Settings, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { StageGateStage } from "@/lib/kr-types/types";

interface StageGateConfigEditorProps {
  keyResult: Doc<"keyResults">;
}

export function StageGateConfigEditor({ keyResult }: StageGateConfigEditorProps) {
  const [open, setOpen] = useState(false);
  const updateKeyResult = useMutation(api.keyResults.updateKeyResult);

  const config = (keyResult.typeConfig ?? { stages: [] }) as { stages: StageGateStage[] };
  const [stages, setStages] = useState<StageGateStage[]>(config.stages);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setStages((keyResult.typeConfig as { stages: StageGateStage[] })?.stages ?? []);
    }
    setOpen(isOpen);
  };

  const addStage = () => {
    setStages([
      ...stages,
      {
        id: crypto.randomUUID(),
        name: "",
        status: "NOT_STARTED" as const,
      },
    ]);
  };

  const removeStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
  };

  const updateStageName = (id: string, name: string) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const updateStageDescription = (id: string, description: string) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, description } : s)));
  };

  const handleSave = async () => {
    const validStages = stages.filter((s) => s.name.trim() !== "");
    if (validStages.length === 0) {
      toast.error("Adicione ao menos um estágio com nome.");
      return;
    }

    try {
      await updateKeyResult({
        id: keyResult._id,
        typeConfig: { stages: validStages },
        targetValue: validStages.length,
      });
      toast.success("Estágios configurados com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar estágios"
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
          title="Configurar estágios"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurar Estágios</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {stages.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
              Nenhum estágio adicionado. Clique em &quot;Adicionar&quot; para começar.
            </p>
          )}
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-start gap-2 p-3 border rounded-md bg-muted/20"
            >
              <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="text-xs font-medium w-5">{index + 1}.</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome do Estágio</Label>
                  <Input
                    value={stage.name}
                    onChange={(e) => updateStageName(stage.id, e.target.value)}
                    placeholder="Ex: Contrato assinado"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Descrição <span className="font-normal">(opcional)</span>
                  </Label>
                  <Input
                    value={stage.description ?? ""}
                    onChange={(e) => updateStageDescription(stage.id, e.target.value)}
                    placeholder="Ex: Finalizar processo de contratação"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-5"
                onClick={() => removeStage(stage.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addStage}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Estágio
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
