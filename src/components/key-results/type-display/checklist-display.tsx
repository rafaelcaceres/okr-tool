import type { ChecklistCategory } from "@/lib/kr-types/types";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ChecklistDisplayProps {
  config: { categories: ChecklistCategory[]; evaluationFrequency: string };
  progressHistory?: { value: number; date: string }[];
}

export function ChecklistDisplay({ config, progressHistory }: ChecklistDisplayProps) {
  const { categories } = config;
  if (categories.length === 0) return null;

  let totalItems = 0;
  let compliantItems = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      totalItems++;
      if (item.compliant) compliantItems++;
    }
  }
  const complianceRate = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;

  // Trend from progress history
  const trend = progressHistory && progressHistory.length >= 2
    ? progressHistory[progressHistory.length - 1].value - progressHistory[progressHistory.length - 2].value
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Compliance
        </h4>
        <div className="flex items-center gap-1.5">
          {trend !== 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? "+" : ""}{trend.toFixed(0)}%
            </span>
          )}
          <span className="text-xs font-bold text-primary">{complianceRate}%</span>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground">
        {compliantItems} de {totalItems} itens em conformidade
      </div>
      {/* Historical compliance mini-chart */}
      {progressHistory && progressHistory.length > 1 && (
        <div className="flex items-end gap-px h-6">
          {progressHistory.slice(-8).map((entry, i) => {
            const height = Math.max(4, (entry.value / 100) * 24);
            return (
              <div
                key={i}
                className="flex-1 bg-primary/30 rounded-t-sm"
                style={{ height: `${height}px` }}
                title={`${entry.date}: ${entry.value}%`}
              />
            );
          })}
        </div>
      )}
      <div className="space-y-1.5">
        {categories.map((cat) => {
          const catTotal = cat.items.length;
          const catCompliant = cat.items.filter((i) => i.compliant).length;
          const catRate = catTotal > 0 ? Math.round((catCompliant / catTotal) * 100) : 0;
          return (
            <div key={cat.id} className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground truncate">{cat.name}</span>
                <span className="font-medium shrink-0 ml-2">{catRate}%</span>
              </div>
              <Progress value={catRate} className="h-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
