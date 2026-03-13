"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { CLevelHeader } from "./c-level-header";
import { CLevelHeroKPIs } from "./c-level-hero-kpis";
import { CLevelInsights } from "./c-level-insights";
import { CLevelFranchiseGrid } from "./c-level-franchise-grid";

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function CLevelDashboard() {
  const cycles = useQuery(api.cycles.getCycles);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");

  const activeCycles = cycles?.filter(
    (c) => c.status === "ATIVO" || c.status === "FINALIZADO" || c.status === "ENCERRADO"
  );

  const cycleId =
    selectedCycleId !== "all"
      ? (selectedCycleId as Id<"cycles">)
      : activeCycles?.[0]?._id;

  const currentDate = getCurrentDate();

  const dashboardData = useQuery(
    api.reports.getCLevelDashboard,
    cycleId ? { cycleId, currentDate } : "skip"
  );

  // Loading state
  if (!cycles) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No cycles available
  if (!cycleId) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel Executivo
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada de todas as franquias
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhum ciclo ativo, finalizado ou encerrado encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading dashboard data
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No franchises with data
  if (dashboardData.franchises.length === 0) {
    return (
      <div className="space-y-6">
        <CLevelHeader
          cycleName={dashboardData.cycle.name}
          cycleStartDate={dashboardData.cycle.startDate}
          cycleEndDate={dashboardData.cycle.endDate}
          selectedCycleId={selectedCycleId}
          onCycleChange={setSelectedCycleId}
          eligibleCycles={activeCycles ?? []}
        />
        <Separator />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma franquia cadastrada. Cadastre franquias na área de Planejamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CLevelHeader
        cycleName={dashboardData.cycle.name}
        cycleStartDate={dashboardData.cycle.startDate}
        cycleEndDate={dashboardData.cycle.endDate}
        selectedCycleId={selectedCycleId}
        onCycleChange={setSelectedCycleId}
        eligibleCycles={activeCycles ?? []}
      />

      <Separator />

      <CLevelHeroKPIs
        globalProgress={dashboardData.globalProgress}
        globalTotalKRs={dashboardData.globalTotalKRs}
        globalTotalObjectives={dashboardData.globalTotalObjectives}
        globalHealth={dashboardData.globalHealth}
      />

      <CLevelInsights insights={dashboardData.insights} />

      <CLevelFranchiseGrid
        franchises={dashboardData.franchises}
        cycleId={cycleId}
      />
    </div>
  );
}
