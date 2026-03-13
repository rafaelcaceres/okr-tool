"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { FranchiseReport } from "@/components/reports/franchise-report";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function FranchiseReportPage({
  params,
}: {
  params: Promise<{ franchiseId: string }>;
}) {
  const { franchiseId } = use(params);
  const searchParams = useSearchParams();
  const cycleId = searchParams.get("ciclo") as Id<"cycles"> | null;

  return (
    <FranchiseReport
      franchiseId={franchiseId as Id<"franchises">}
      cycleId={cycleId ?? undefined}
    />
  );
}
