"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type CLevelInsight =
  | { type: "alert"; text: string }
  | { type: "highlight"; text: string }
  | { type: "info"; text: string };

interface CLevelInsightsProps {
  insights: CLevelInsight[];
}

const insightConfig = {
  alert: {
    icon: AlertTriangle,
    borderClass: "border-l-destructive",
    iconClass: "text-destructive",
    bgClass: "bg-destructive/5",
  },
  highlight: {
    icon: TrendingUp,
    borderClass: "border-l-success",
    iconClass: "text-success",
    bgClass: "bg-success/5",
  },
  info: {
    icon: Info,
    borderClass: "border-l-primary",
    iconClass: "text-primary",
    bgClass: "bg-primary/5",
  },
} as const;

export function CLevelInsights({ insights }: CLevelInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          {insights.map((insight, index) => {
            const config = insightConfig[insight.type];
            const Icon = config.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md border-l-4",
                  config.borderClass,
                  config.bgClass
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", config.iconClass)} />
                <span className="text-sm text-foreground">{insight.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
