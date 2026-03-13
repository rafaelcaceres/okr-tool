"use client";

import { FranchiseList } from "@/components/franchises/franchise-list";
import { CreateFranchiseDialog } from "@/components/franchises/create-franchise-dialog";

export default function FranquiasPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Franquias</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as franquias da organização.
          </p>
        </div>
        <CreateFranchiseDialog />
      </div>

      <FranchiseList />
    </div>
  );
}
