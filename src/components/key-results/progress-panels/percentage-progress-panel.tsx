"use client";

import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PercentageProgressPanelProps {
  keyResult: Doc<"keyResults">;
  value: number;
  onChange: (value: number) => void;
}

export function PercentageProgressPanel({
  keyResult,
  value,
  onChange,
}: PercentageProgressPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <Label className="text-base font-semibold">Valor Atual</Label>
        <span className="text-2xl font-bold text-primary">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>0%</span>
        <span className="text-primary">Meta: {keyResult.targetValue}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
