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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ChecklistCategory, EvaluationFrequency } from "@/lib/kr-types/types";

interface ChecklistConfigEditorProps {
  keyResult: Doc<"keyResults">;
}

interface ChecklistConfig {
  categories: ChecklistCategory[];
  evaluationFrequency: EvaluationFrequency;
}

export function ChecklistConfigEditor({ keyResult }: ChecklistConfigEditorProps) {
  const [open, setOpen] = useState(false);
  const updateKeyResult = useMutation(api.keyResults.updateKeyResult);

  const config = (keyResult.typeConfig ?? {
    categories: [],
    evaluationFrequency: "QUARTERLY",
  }) as ChecklistConfig;

  const [categories, setCategories] = useState<ChecklistCategory[]>(config.categories);
  const [frequency, setFrequency] = useState<EvaluationFrequency>(config.evaluationFrequency);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      const c = (keyResult.typeConfig ?? {
        categories: [],
        evaluationFrequency: "QUARTERLY",
      }) as ChecklistConfig;
      setCategories(c.categories);
      setFrequency(c.evaluationFrequency);
    }
    setOpen(isOpen);
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: crypto.randomUUID(),
        name: "",
        items: [],
      },
    ]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategoryName = (id: string, name: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const addItem = (categoryId: string) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: [
                ...c.items,
                {
                  id: crypto.randomUUID(),
                  description: "",
                  compliant: false,
                },
              ],
            }
          : c
      )
    );
  };

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
  };

  const updateItemDescription = (categoryId: string, itemId: string, description: string) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, description } : i
              ),
            }
          : c
      )
    );
  };

  const handleSave = async () => {
    const validCategories = categories
      .filter((c) => c.name.trim() !== "")
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => i.description.trim() !== ""),
      }));

    if (validCategories.length === 0) {
      toast.error("Adicione ao menos uma categoria com nome.");
      return;
    }

    const hasEmptyCategory = validCategories.some((c) => c.items.length === 0);
    if (hasEmptyCategory) {
      toast.error("Cada categoria deve ter ao menos um item.");
      return;
    }

    try {
      await updateKeyResult({
        id: keyResult._id,
        typeConfig: {
          categories: validCategories,
          evaluationFrequency: frequency,
        },
      });
      toast.success("Checklist configurado com sucesso");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar checklist"
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
          title="Configurar checklist"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar Checklist de Compliance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-sm font-medium">Frequência de Avaliação</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as EvaluationFrequency)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="QUARTERLY">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
              Nenhuma categoria adicionada. Clique em &quot;Adicionar Categoria&quot; para começar.
            </p>
          )}

          {categories.map((category) => (
            <div key={category.id} className="border rounded-md p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategoryName(category.id, e.target.value)}
                  placeholder="Nome da categoria"
                  className="h-8 text-sm font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="pl-3 space-y-2 border-l-2 border-muted">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItemDescription(category.id, item.id, e.target.value)
                      }
                      placeholder="Descrição do item"
                      className="h-7 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem(category.id, item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => addItem(category.id)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addCategory}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Categoria
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
