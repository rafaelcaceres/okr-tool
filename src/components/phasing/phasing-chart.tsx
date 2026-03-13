"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { type KrType } from "@/lib/kr-types";
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

function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd/MMM", { locale: ptBR });
}

export function PhasingChart({ keyResult, cycleStartDate, cycleEndDate }: PhasingChartProps) {
  const phasing = useQuery(api.phasing.getPhasing, {
    keyResultId: keyResult._id,
  });
  const progressEntries = useQuery(api.progressEntries.getProgressEntries, {
    keyResultId: keyResult._id,
  });

  if (phasing === undefined) return null;

  if (phasing.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">
        Defina o progresso planejado para visualizar a projeção de resultados.
      </p>
    );
  }

  const krType = resolveKrType(keyResult);
  const pointInTime = isPointInTime(krType);

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
