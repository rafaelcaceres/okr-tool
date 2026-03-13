"use client";

import { FranchiseList } from "@/components/franchises/franchise-list";
import { CreateFranchiseDialog } from "@/components/franchises/create-franchise-dialog";

export default function FranquiasPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Franquias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as franquias da organização.
          </p>
        </div>
        <CreateFranchiseDialog />
      </div>

      <FranchiseList />
    </div>
  );
}
