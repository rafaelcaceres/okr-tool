"use client";

import type { Doc } from "../../../convex/_generated/dataModel";
import type { KrType, KrTypeConfigMap } from "@/lib/kr-types/types";
import {
  isStageGateConfig,
  isChecklistConfig,
  isMultiPhaseConfig,
} from "@/lib/kr-types/resolve";
import { Separator } from "@/components/ui/separator";
import { StageGateConfigEditor } from "./type-config/stage-gate-config-editor";
import { ChecklistConfigEditor } from "./type-config/checklist-config-editor";
import { MultiPhaseConfigEditor } from "./type-config/multi-phase-config-editor";
import { StageGateDisplay } from "./type-display/stage-gate-display";
import { ChecklistDisplay } from "./type-display/checklist-display";
import { MultiPhaseDisplay } from "./type-display/multi-phase-display";
import type {
  StageGateConfig,
  ChecklistComplianceConfig,
  MultiPhaseWithRiskConfig,
} from "@/lib/kr-types/types";

interface TypeConfigSectionProps {
  krType: KrType;
  typeConfig: KrTypeConfigMap[KrType];
  keyResult: Doc<"keyResults">;
}

const STRUCTURED_TYPES: Record<
  string,
  {
    isEmpty: (config: KrTypeConfigMap[KrType]) => boolean;
    ctaTitle: string;
    ctaDescription: string;
    Editor: React.ComponentType<{ keyResult: Doc<"keyResults"> }>;
    Display: React.ComponentType<{ config: never }>;
    getDisplayConfig: (config: KrTypeConfigMap[KrType]) => unknown;
  }
> = {
  STAGE_GATE: {
    isEmpty: (config) =>
      !isStageGateConfig(config) || config.stages.length === 0,
    ctaTitle: "Configurar Estágios",
    ctaDescription: "Adicione os estágios sequenciais deste Key Result.",
    Editor: StageGateConfigEditor,
    Display: StageGateDisplay as React.ComponentType<{ config: never }>,
    getDisplayConfig: (config) => config as StageGateConfig,
  },
  CHECKLIST_COMPLIANCE: {
    isEmpty: (config) =>
      !isChecklistConfig(config) || config.categories.length === 0,
    ctaTitle: "Configurar Checklist",
    ctaDescription: "Adicione categorias e itens de compliance.",
    Editor: ChecklistConfigEditor,
    Display: ChecklistDisplay as React.ComponentType<{ config: never }>,
    getDisplayConfig: (config) => config as ChecklistComplianceConfig,
  },
  MULTI_PHASE_WITH_RISK: {
    isEmpty: (config) =>
      !isMultiPhaseConfig(config) || config.workstreams.length === 0,
    ctaTitle: "Configurar Workstreams",
    ctaDescription: "Adicione workstreams e fases do roadmap.",
    Editor: MultiPhaseConfigEditor,
    Display: MultiPhaseDisplay as React.ComponentType<{ config: never }>,
    getDisplayConfig: (config) => config as MultiPhaseWithRiskConfig,
  },
};

export function TypeConfigSection({
  krType,
  typeConfig,
  keyResult,
}: TypeConfigSectionProps) {
  const typeDef = STRUCTURED_TYPES[krType];
  if (!typeDef) return null;

  const empty = typeDef.isEmpty(typeConfig);

  if (empty) {
    return (
      <>
        <Separator />
        <div className="flex items-center gap-3 p-3 border border-dashed rounded-md bg-muted/10">
          <div className="flex-1">
            <p className="text-sm font-medium">{typeDef.ctaTitle}</p>
            <p className="text-xs text-muted-foreground">
              {typeDef.ctaDescription}
            </p>
          </div>
          <typeDef.Editor keyResult={keyResult} />
        </div>
      </>
    );
  }

  // Stage-gate and multi-phase displays are handled by PhasingChart's timeline view
  if (krType === "STAGE_GATE" || krType === "MULTI_PHASE_WITH_RISK") {
    return null;
  }

  const displayConfig = typeDef.getDisplayConfig(typeConfig);

  return (
    <>
      <Separator />
      <typeDef.Display config={displayConfig as never} />
    </>
  );
}
