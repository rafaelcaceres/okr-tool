"use client";

import { CycleList } from "@/components/cycles/cycle-list";
import { CreateCycleDialog } from "@/components/cycles/create-cycle-dialog";

export default function CiclosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Ciclos de Planejamento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os ciclos de planejamento de OKRs.
          </p>
        </div>
        <CreateCycleDialog />
      </div>

      <CycleList />
    </div>
  );
}
