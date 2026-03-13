"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BarChart3, Filter, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { FranchiseSummaryCard } from "@/components/reports/franchise-summary-card";

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function RelatoriosPage() {
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
    api.reports.getReportsDashboard,
    cycleId ? { cycleId, currentDate } : "skip"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Visão geral de performance e relatórios detalhados por franquia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/relatorios/c-level">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              Painel Executivo
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
          <div className="px-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </div>
          <Select
            value={selectedCycleId}
            onValueChange={setSelectedCycleId}
          >
            <SelectTrigger className="w-[220px] border-none shadow-none h-8 focus:ring-0">
              <SelectValue placeholder="Selecione um ciclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ciclo mais recente</SelectItem>
              {activeCycles?.map((cycle) => (
                <SelectItem key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status === "ATIVO" ? "Ativo" : cycle.status === "FINALIZADO" ? "Finalizado" : "Encerrado"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Loading */}
      {!cycles ? (
        <div className="space-y-4">
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3 h-48 bg-muted/50 rounded-lg animate-pulse" />
            <div className="lg:col-span-2 h-48 bg-muted/50 rounded-lg animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : !cycleId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhum ciclo ativo, finalizado ou encerrado encontrado.
            </p>
          </CardContent>
        </Card>
      ) : !dashboardData ? (
        <div className="space-y-4">
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3 h-48 bg-muted/50 rounded-lg animate-pulse" />
            <div className="lg:col-span-2 h-48 bg-muted/50 rounded-lg animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : dashboardData.franchises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma franquia cadastrada. Cadastre franquias na área de Planejamento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Dashboard Charts */}
          <ReportsDashboard
            franchises={dashboardData.franchises}
            globalHealth={dashboardData.globalHealth}
            globalTotalKRs={dashboardData.globalTotalKRs}
          />

          {/* Franchise Cards */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Franquias
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {dashboardData.franchises.map((franchise) => (
                <FranchiseSummaryCard
                  key={franchise._id}
                  franchiseId={franchise._id}
                  name={franchise.name}
                  cycleId={cycleId}
                  objectiveCount={franchise.objectiveCount}
                  krCount={franchise.krCount}
                  avgProgress={franchise.avgProgress}
                  healthCounts={franchise.healthCounts}
                  predominantHealth={franchise.predominantHealth}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
