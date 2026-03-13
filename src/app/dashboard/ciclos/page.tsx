"use client";

import { CycleList } from "@/components/cycles/cycle-list";
import { CreateCycleDialog } from "@/components/cycles/create-cycle-dialog";

export default function CiclosPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ciclos de Planejamento
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie os ciclos de planejamento de OKRs.
          </p>
        </div>
        <CreateCycleDialog />
      </div>

      <CycleList />
    </div>
  );
}
