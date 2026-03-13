"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ObjectiveList } from "@/components/objectives/objective-list";
import { CreateObjectiveDialog } from "@/components/objectives/create-objective-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Filter } from "lucide-react";

export default function PlanejamentoPage() {
  const cycles = useQuery(api.cycles.getCycles);
  const franchises = useQuery(api.franchises.getFranchises);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");
  const [selectedFranchiseId, setSelectedFranchiseId] =
    useState<string>("all");

  const cycleId =
    selectedCycleId && selectedCycleId !== "all"
      ? (selectedCycleId as Id<"cycles">)
      : undefined;

  const franchiseId =
    selectedFranchiseId && selectedFranchiseId !== "all"
      ? (selectedFranchiseId as Id<"franchises">)
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Objetivos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e planeje os objetivos estratégicos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
            <div className="px-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
            </div>
            <Select
              value={selectedFranchiseId}
              onValueChange={setSelectedFranchiseId}
            >
              <SelectTrigger className="w-[180px] border-none shadow-none h-8 focus:ring-0">
                <SelectValue placeholder="Todas as franquias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as franquias</SelectItem>
                {franchises?.map((franchise) => (
                  <SelectItem key={franchise._id} value={franchise._id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-border mx-1" />
            <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
              <SelectTrigger className="w-[180px] border-none shadow-none h-8 focus:ring-0">
                <SelectValue placeholder="Todos os ciclos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os ciclos</SelectItem>
                {cycles?.map((cycle) => (
                  <SelectItem key={cycle._id} value={cycle._id}>
                    {cycle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CreateObjectiveDialog />
        </div>
      </div>

      <Separator />

      <ObjectiveList cycleId={cycleId} franchiseId={franchiseId} />
    </div>
  );
}
