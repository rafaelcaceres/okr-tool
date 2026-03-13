"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { ChecklistCategory } from "@/lib/kr-types/types";

interface ChecklistProgressPanelProps {
  keyResult: Doc<"keyResults">;
}

export function ChecklistProgressPanel({ keyResult }: ChecklistProgressPanelProps) {
  const updateChecklistItems = useMutation(api.keyResults.updateChecklistItems);
  const config = (keyResult.typeConfig ?? { categories: [], evaluationFrequency: "QUARTERLY" }) as {
    categories: ChecklistCategory[];
    evaluationFrequency: string;
  };
  const categories = config.categories;

  let totalItems = 0;
  let compliantItems = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      totalItems++;
      if (item.compliant) compliantItems++;
    }
  }
  const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

  const handleToggle = async (categoryId: string, itemId: string, compliant: boolean) => {
    try {
      await updateChecklistItems({
        id: keyResult._id,
        categoryId,
        itemId,
        compliant,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar item"
      );
    }
  };

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
        Nenhuma categoria configurada. Use o botão de configuração para adicionar categorias e itens.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border">
        <span className="text-sm text-muted-foreground">Compliance</span>
        <span className="text-2xl font-bold text-primary">{complianceRate}%</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {compliantItems} de {totalItems} itens em conformidade
      </div>

      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">{category.name}</h4>
            <div className="space-y-1 pl-1">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    item.compliant ? "bg-green-50 dark:bg-green-950/20" : "hover:bg-muted/30"
                  }`}
                >
                  <Checkbox
                    id={`${category.id}-${item.id}`}
                    checked={item.compliant}
                    onCheckedChange={(checked) =>
                      handleToggle(category.id, item.id, !!checked)
                    }
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    htmlFor={`${category.id}-${item.id}`}
                    className={`text-sm cursor-pointer flex-1 ${
                      item.compliant ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.description}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
