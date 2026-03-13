"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { type KrType } from "@/lib/kr-types";
import type {
  StageGateStage,
  StageGateConfig,
  Workstream,
  MultiPhaseWithRiskConfig,
  StageStatus,
} from "@/lib/kr-types/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";

interface PhasingChartProps {
  keyResult: Doc<"keyResults">;
  cycleStartDate?: string;
  cycleEndDate?: string;
}

function resolveKrType(kr: Doc<"keyResults">): KrType {
  if (kr.krType) return kr.krType as KrType;
  switch (kr.measurementType) {
    case "FINANCIAL":
    case "NUMERIC":
      return "CUMULATIVE_NUMERIC";
    case "PERCENTUAL":
      return "PROGRESSIVE_PERCENTAGE";
    case "MILESTONE":
      return "STAGE_GATE";
    default:
      return "CUMULATIVE_NUMERIC";
  }
}

/** Point-in-time types compare the current reading to the planned value for that period */
function isPointInTime(krType: KrType): boolean {
  return krType === "PERIODIC_INDEX" || krType === "CHECKLIST_COMPLIANCE";
}

/** Timeline types store already-cumulative values (stage/phase counts) */
function isTimeline(krType: KrType): boolean {
  return krType === "STAGE_GATE" || krType === "MULTI_PHASE_WITH_RISK";
}

function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd/MMM", { locale: ptBR });
}

// ─── Timeline item types ────────────────────────────────────────────────────

interface TimelineItemData {
  name: string;
  group?: string;
  status: StageStatus;
  completedAt?: number;
  plannedDate?: string;
}

function getTimelineItemsFromKr(kr: Doc<"keyResults">, krType: KrType): TimelineItemData[] {
  const config = kr.typeConfig as Record<string, unknown> | undefined;
  if (!config) return [];

  if (krType === "STAGE_GATE") {
    const stages = (config.stages as StageGateStage[]) ?? [];
    return stages.map((s) => ({
      name: s.name,
      status: s.status,
      completedAt: s.completedAt,
    }));
  }

  if (krType === "MULTI_PHASE_WITH_RISK") {
    const workstreams = (config.workstreams as Workstream[]) ?? [];
    const items: TimelineItemData[] = [];
    for (const ws of workstreams) {
      for (const phase of ws.phases) {
        items.push({
          name: phase.name,
          group: ws.name,
          status: phase.status,
          completedAt: phase.completedAt,
        });
      }
    }
    return items;
  }

  return [];
}

function assignPlannedDates(
  items: TimelineItemData[],
  phasingPoints: { date: string; value: number }[]
): TimelineItemData[] {
  // Phasing points are cumulative: { date, value: cumulativeCount }
  // Reconstruct: first N items → first period, next M → second period, etc.
  const sorted = [...phasingPoints].sort((a, b) => a.date.localeCompare(b.date));
  const result = items.map((item) => ({ ...item }));
  let prevCumulative = 0;
  let itemIndex = 0;

  for (const entry of sorted) {
    const count = entry.value - prevCumulative;
    for (let i = 0; i < count && itemIndex < result.length; i++) {
      result[itemIndex].plannedDate = entry.date;
      itemIndex++;
    }
    prevCumulative = entry.value;
  }

  return result;
}

function TimelineChart({
  items,
  today,
}: {
  items: TimelineItemData[];
  today: string;
}) {
  // Unique periods as columns
  const periods = [...new Set(items.map((i) => i.plannedDate).filter(Boolean))] as string[];
  periods.sort();

  const completed = items.filter((i) => i.status === "COMPLETED").length;
  const hasPeriods = periods.length > 0;

  let currentGroup: string | undefined;

  return (
    <div className="mt-2 space-y-3">
      {/* Summary bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Progresso
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {completed}/{items.length}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
          {items.map((item, i) => {
            const isLate =
              item.status !== "COMPLETED" &&
              item.plannedDate &&
              item.plannedDate < today;
            return (
              <div
                key={i}
                className={`h-full transition-all duration-500 ${
                  item.status === "COMPLETED"
                    ? "bg-green-500"
                    : item.status === "IN_PROGRESS"
                      ? "bg-blue-500"
                      : isLate
                        ? "bg-red-400"
                        : "bg-transparent"
                }`}
                style={{ width: `${100 / items.length}%` }}
                title={`${item.name}: ${
                  item.status === "COMPLETED"
                    ? "Concluído"
                    : item.status === "IN_PROGRESS"
                      ? "Em andamento"
                      : isLate
                        ? "Atrasado"
                        : "Pendente"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Period columns header (only if phasing is set) */}
      {hasPeriods && (
        <div className="flex gap-px">
          {/* Spacer for the name column */}
          <div className="w-[110px] shrink-0" />
          <div className="flex-1 flex">
            {periods.map((p) => {
              const isPast = p < today;
              return (
                <div
                  key={p}
                  className="flex-1 text-center"
                >
                  <span className={`text-[9px] font-medium ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
                    {format(parseISO(p), "MMM yy", { locale: ptBR })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const showGroup = item.group && item.group !== currentGroup;
          if (item.group) currentGroup = item.group;

          const isLate =
            item.status !== "COMPLETED" &&
            item.plannedDate &&
            item.plannedDate < today;
          const completedLate =
            item.status === "COMPLETED" &&
            item.completedAt &&
            item.plannedDate &&
            format(new Date(item.completedAt), "yyyy-MM-dd") > item.plannedDate;

          const periodIndex = item.plannedDate ? periods.indexOf(item.plannedDate) : -1;

          // Bar color
          const barColor = item.status === "COMPLETED"
            ? completedLate ? "bg-amber-400" : "bg-green-500"
            : item.status === "IN_PROGRESS"
              ? "bg-blue-500"
              : isLate
                ? "bg-red-400"
                : "bg-muted-foreground/15";

          // Status icon
          const statusIcon = item.status === "COMPLETED"
            ? <Check className="h-2.5 w-2.5 text-white" />
            : item.status === "IN_PROGRESS"
              ? <Loader2 className="h-2.5 w-2.5 text-white animate-spin" />
              : null;

          const iconBg = item.status === "COMPLETED"
            ? completedLate ? "bg-amber-500" : "bg-green-500"
            : item.status === "IN_PROGRESS"
              ? "bg-blue-500"
              : isLate
                ? "bg-red-400"
                : "bg-muted-foreground/20";

          return (
            <div key={i}>
              {showGroup && (
                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1 pl-1">
                  {item.group}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                {/* Icon + Name */}
                <div className="w-[110px] shrink-0 flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                  >
                    {statusIcon}
                  </div>
                  <span
                    className={`text-[11px] truncate ${
                      item.status === "COMPLETED"
                        ? "text-muted-foreground line-through decoration-muted-foreground/40"
                        : "text-foreground"
                    }`}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Gantt bar area */}
                {hasPeriods ? (
                  <div className="flex-1 flex items-center">
                    {periods.map((_, pi) => (
                      <div key={pi} className="flex-1 h-5 flex items-center px-0.5">
                        {pi === periodIndex && (
                          <div
                            className={`h-3 w-full rounded-md ${barColor}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No phasing: show simple status badge */
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      item.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : item.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.status === "COMPLETED"
                      ? "Concluído"
                      : item.status === "IN_PROGRESS"
                        ? "Em andamento"
                        : "Pendente"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {hasPeriods && (
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
            <span className="text-[9px] text-muted-foreground">Concluído</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span className="text-[9px] text-muted-foreground">Em andamento</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
            <span className="text-[9px] text-muted-foreground">Atrasado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-[9px] text-muted-foreground">Concluído c/ atraso</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/15" />
            <span className="text-[9px] text-muted-foreground">Pendente</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main PhasingChart ──────────────────────────────────────────────────────

export function PhasingChart({ keyResult, cycleStartDate, cycleEndDate }: PhasingChartProps) {
  const phasing = useQuery(api.phasing.getPhasing, {
    keyResultId: keyResult._id,
  });
  const progressEntries = useQuery(api.progressEntries.getProgressEntries, {
    keyResultId: keyResult._id,
  });

  if (phasing === undefined) return null;

  const krType = resolveKrType(keyResult);
  const pointInTime = isPointInTime(krType);
  const timeline = isTimeline(krType);

  if (phasing.length === 0) {
    // Timeline types: show items without planned dates as fallback
    if (timeline) {
      const items = getTimelineItemsFromKr(keyResult, krType);
      if (items.length > 0) {
        const today = format(new Date(), "yyyy-MM-dd");
        return <TimelineChart items={items} today={today} />;
      }
    }
    return (
      <p className="text-xs text-gray-400 italic py-2">
        Defina o progresso planejado para visualizar a projeção de resultados.
      </p>
    );
  }

  // 1. Prepare phasing points
  const phasingPoints = phasing.map(p => {
    let dateStr = p.date;
    if (!dateStr && p.month) {
      const dateObj = parseISO(`${p.month}-01`);
      const end = endOfMonth(dateObj);
      dateStr = format(end, "yyyy-MM-dd");
    }
    return { date: dateStr || "", value: p.plannedValue };
  }).filter(p => p.date).sort((a, b) => a.date.localeCompare(b.date));

  // Timeline types render a stage/phase list instead of a line chart
  if (timeline) {
    const items = getTimelineItemsFromKr(keyResult, krType);
    const itemsWithDates = assignPlannedDates(items, phasingPoints);
    const today = format(new Date(), "yyyy-MM-dd");
    return <TimelineChart items={itemsWithDates} today={today} />;
  }

  // 2. Build planned timeline
  const plannedTimeline: { date: string; value: number }[] = [];

  if (pointInTime) {
    // Point-in-time: each phasing entry is an independent target for that period
    if (cycleStartDate) {
      plannedTimeline.push({ date: cycleStartDate, value: phasingPoints[0]?.value ?? keyResult.initialValue });
    }
    for (const point of phasingPoints) {
      plannedTimeline.push({ date: point.date, value: point.value });
    }
  } else {
    // Cumulative: accumulate phasing values from initialValue
    let cumulative = keyResult.initialValue;
    if (cycleStartDate) {
      plannedTimeline.push({ date: cycleStartDate, value: keyResult.initialValue });
    }
    for (const point of phasingPoints) {
      if (keyResult.direction === "DECREASING") {
        cumulative -= point.value;
      } else {
        cumulative += point.value;
      }
      plannedTimeline.push({ date: point.date, value: cumulative });
    }
  }

  // 3. Interpolation helper for planned values
  const getPlannedValueAtDate = (targetDate: string) => {
    if (plannedTimeline.length === 0) return keyResult.initialValue;

    const sorted = [...plannedTimeline].sort((a, b) => a.date.localeCompare(b.date));

    if (targetDate <= sorted[0].date) return sorted[0].value;

    if (targetDate >= sorted[sorted.length - 1].date) {
      if (!pointInTime && cycleEndDate && targetDate >= cycleEndDate && sorted[sorted.length - 1].date < cycleEndDate) {
        const lastPoint = sorted[sorted.length - 1];
        const lastDate = parseISO(lastPoint.date).getTime();
        const endDate = parseISO(cycleEndDate).getTime();
        const targetTime = parseISO(targetDate).getTime();
        if (endDate === lastDate) return lastPoint.value;
        const ratio = (targetTime - lastDate) / (endDate - lastDate);
        return lastPoint.value + (keyResult.targetValue - lastPoint.value) * ratio;
      }
      return sorted[sorted.length - 1].value;
    }

    const index = sorted.findIndex(p => p.date >= targetDate);
    if (index === -1) return sorted[sorted.length - 1].value;

    const next = sorted[index];
    const prev = sorted[index - 1];

    if (pointInTime) {
      // For point-in-time: use step function (hold previous value until next period)
      return prev.value;
    }

    // Cumulative: linear interpolation
    const prevTime = parseISO(prev.date).getTime();
    const nextTime = parseISO(next.date).getTime();
    const targetTime = parseISO(targetDate).getTime();

    if (nextTime === prevTime) return prev.value;

    const ratio = (targetTime - prevTime) / (nextTime - prevTime);
    return prev.value + (next.value - prev.value) * ratio;
  };

  // 4. Collect all dates
  const allDates = new Set<string>();
  plannedTimeline.forEach(p => allDates.add(p.date));

  if (progressEntries) {
    for (const entry of progressEntries) {
      const d = format(new Date(entry.recordedAt), "yyyy-MM-dd");
      allDates.add(d);
    }
  }

  const today = format(new Date(), "yyyy-MM-dd");
  allDates.add(today);

  if (cycleEndDate) {
    allDates.add(cycleEndDate);
  }

  // 5. Build chart data
  const sortedDates = Array.from(allDates).sort();

  const chartData = sortedDates.map(date => {
    const planned = getPlannedValueAtDate(date);

    let real: number | undefined;
    if (progressEntries && date <= today) {
      const dateEnd = parseISO(date);
      dateEnd.setHours(23, 59, 59, 999);
      const timestamp = dateEnd.getTime();

      const relevant = progressEntries.filter(p => p.recordedAt <= timestamp);
      if (relevant.length > 0) {
        relevant.sort((a, b) => a.recordedAt - b.recordedAt);
        real = relevant[relevant.length - 1].value;
      } else {
        if (cycleStartDate && date >= cycleStartDate) {
          real = keyResult.initialValue;
        }
      }
    }

    return {
      label: formatDateLabel(date),
      date,
      timestamp: parseISO(date).getTime(),
      planejado: Number(planned.toFixed(2)),
      real,
    };
  });

  const hasRealData = chartData.some((d) => d.real !== undefined);
  const plannedLabel = pointInTime ? "Meta" : "Planejado";
  const lineType = pointInTime ? "stepAfter" as const : "monotone" as const;

  return (
    <div className="w-full h-48 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(unixTime) => format(new Date(unixTime), "dd/MMM", { locale: ptBR })}
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: "#e5e7eb" }}
            interval="preserveStartEnd"
            scale="time"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: "#e5e7eb" }}
            width={30}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [
              value ?? 0,
              name === "planejado" ? plannedLabel : "Real",
            ]}
            labelFormatter={(label) => {
              if (typeof label === "number") {
                return `Data: ${format(new Date(label), "dd/MM/yyyy", { locale: ptBR })}`;
              }
              return `Data: ${label}`;
            }}
            contentStyle={{ fontSize: 12 }}
          />
          {hasRealData && (
            <Legend
              formatter={(value) =>
                value === "planejado" ? plannedLabel : "Real"
              }
              wrapperStyle={{ fontSize: 10 }}
            />
          )}
          {!pointInTime && (
            <ReferenceLine
              y={keyResult.targetValue}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: "Meta",
                position: "right",
                fontSize: 10,
                fill: "#94a3b8",
              }}
            />
          )}
          <Line
            type={lineType}
            dataKey="planejado"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#3b82f6" }}
            activeDot={{ r: 5 }}
          />
          {hasRealData && (
            <Line
              type="monotone"
              dataKey="real"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
