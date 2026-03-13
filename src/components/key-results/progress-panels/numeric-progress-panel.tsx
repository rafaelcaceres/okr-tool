"use client";

import { Doc } from "../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type KrType, formatKrValue } from "@/lib/kr-types";

function resolveTypeConfig(kr: Doc<"keyResults">): Record<string, unknown> {
  if (kr.typeConfig) return kr.typeConfig as Record<string, unknown>;
  const direction = kr.direction ?? "INCREASING";
  switch (kr.measurementType) {
    case "FINANCIAL":
      return { direction, unit: kr.currency ?? kr.unit, currency: kr.currency };
    default:
      return { direction, unit: kr.unit };
  }
}

interface NumericProgressPanelProps {
  keyResult: Doc<"keyResults">;
  krType: KrType;
  value: number;
  onChange: (value: number) => void;
}

export function NumericProgressPanel({
  keyResult,
  krType,
  value,
  onChange,
}: NumericProgressPanelProps) {
  const typeConfig = resolveTypeConfig(keyResult);
  const isFinancial =
    keyResult.measurementType === "FINANCIAL" ||
    !!(typeConfig as Record<string, unknown>)?.currency;
  const isPeriodic = krType === "PERIODIC_INDEX";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          {isPeriodic ? "Leitura Atual" : "Valor Atual"}{" "}
          ({isFinancial ? "monetário" : keyResult.unit})
        </Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={isFinancial ? "0.01" : "any"}
          className="text-lg font-medium"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
        <span>
          Inicial:{" "}
          <span className="font-medium text-foreground">
            {formatKrValue(krType, keyResult.initialValue, typeConfig)}
          </span>
        </span>
        <span>
          Meta:{" "}
          <span className="font-medium text-primary">
            {formatKrValue(krType, keyResult.targetValue, typeConfig)}
          </span>
        </span>
      </div>
    </div>
  );
}
