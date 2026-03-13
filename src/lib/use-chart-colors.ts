"use client";

import { useMemo } from "react";

/**
 * Returns resolved CSS color values from design system tokens
 * for use in Recharts SVG fills (which don't support CSS var()).
 *
 * Usage: const colors = useChartColors();
 *        fill={colors.success}
 */
export function useChartColors() {
    return useMemo(() => {
        if (typeof window === "undefined") return fallbackColors;

        const style = getComputedStyle(document.documentElement);
        const get = (name: string) => {
            const val = style.getPropertyValue(name).trim();
            return val || undefined;
        };

        return {
            primary: get("--primary") ?? fallbackColors.primary,
            success: get("--success") ?? fallbackColors.success,
            warning: get("--warning") ?? fallbackColors.warning,
            destructive: get("--destructive") ?? fallbackColors.destructive,
            mutedForeground: get("--muted-foreground") ?? fallbackColors.mutedForeground,
            muted: get("--muted") ?? fallbackColors.muted,
            foreground: get("--foreground") ?? fallbackColors.foreground,
            card: get("--card") ?? fallbackColors.card,
            border: get("--border") ?? fallbackColors.border,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

const fallbackColors = {
    primary: "#7c3aed",
    success: "#22c55e",
    warning: "#eab308",
    destructive: "#ef4444",
    mutedForeground: "#737373",
    muted: "#f5f5f5",
    foreground: "#171717",
    card: "#ffffff",
    border: "#e5e5e5",
};
