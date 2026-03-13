"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { ReportHeader } from "./report-header";
import { ReportFilters, HealthFilter } from "./report-filters";
import { ObjectiveReportCard } from "./objective-report-card";
import { FranchiseExecutiveSummary } from "./franchise-executive-summary";

function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

interface FranchiseReportProps {
  franchiseId: Id<"franchises">;
  cycleId?: Id<"cycles">;
}

export function FranchiseReport({ franchiseId, cycleId: initialCycleId }: FranchiseReportProps) {
  const cycles = useQuery(api.cycles.getCycles);
  const [selectedCycleId, setSelectedCycleId] = useState<string>(initialCycleId ?? "auto");
  const [activeFilters, setActiveFilters] = useState<HealthFilter[]>([]);

  const eligibleCycles = cycles?.filter(
    (c) => c.status === "ATIVO" || c.status === "FINALIZADO" || c.status === "ENCERRADO"
  );

  const effectiveCycleId =
    selectedCycleId !== "auto"
      ? (selectedCycleId as Id<"cycles">)
      : initialCycleId ?? eligibleCycles?.[0]?._id;

  const currentDate = getCurrentDate();

  const reportData = useQuery(
    api.reports.getFranchiseReport,
    effectiveCycleId
      ? { franchiseId, cycleId: effectiveCycleId, currentDate }
      : "skip"
  );

  // Filter logic
  const filteredObjectives = useMemo(() => {
    if (!reportData) return [];
    if (activeFilters.length === 0) return reportData.objectives;

    return reportData.objectives
      .map((obj) => ({
        ...obj,
        keyResults: obj.keyResults.filter((kr) =>
          activeFilters.includes(kr.health as HealthFilter)
        ),
      }))
      .filter((obj) => obj.keyResults.length > 0);
  }, [reportData, activeFilters]);

  // Handlers
  const handleToggleFilter = (filter: HealthFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleClearFilters = () => setActiveFilters([]);

  // Loading
  if (!cycles) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-8 bg-muted/50 rounded-lg animate-pulse w-1/3" />
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // No cycle available
  if (!effectiveCycleId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhum ciclo disponível para relatório.</p>
        </CardContent>
      </Card>
    );
  }

  // Loading report data
  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-8 bg-muted/50 rounded-lg animate-pulse w-1/3" />
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const hasFilterResults = filteredObjectives.length > 0;
  const hasFiltersActive = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReportHeader
        franchiseName={reportData.franchise.name}
        cycleName={reportData.cycle.name}
        cycleStartDate={reportData.cycle.startDate}
        cycleEndDate={reportData.cycle.endDate}
        healthSummary={reportData.healthSummary}
        totalKRs={reportData.totalKRs}
        selectedCycleId={selectedCycleId}
        onCycleChange={setSelectedCycleId}
        eligibleCycles={eligibleCycles ?? []}
      />

      <Separator />

      {/* Executive Summary Charts */}
      {reportData.totalKRs > 0 && (
        <FranchiseExecutiveSummary
          overallProgress={reportData.overallProgress}
          healthSummary={reportData.healthSummary}
          totalKRs={reportData.totalKRs}
          objectives={reportData.objectives.map((o) => ({
            title: o.title,
            progress: o.progress,
            status: o.status,
          }))}
          progressTimeline={reportData.progressTimeline}
        />
      )
      }

      <Separator />

      {/* Filters */}
      {reportData.totalKRs > 0 && (
        <ReportFilters
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Objectives */}
      {reportData.objectives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Nenhum objetivo encontrado para esta franquia neste ciclo.
            </p>
          </CardContent>
        </Card>
      ) : !hasFilterResults && hasFiltersActive ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">
              Nenhum Key Result encontrado para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredObjectives.map((objective) => (
            <ObjectiveReportCard
              key={objective._id}
              objective={objective}
              cycleStartDate={reportData.cycle.startDate}
              cycleEndDate={reportData.cycle.endDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
