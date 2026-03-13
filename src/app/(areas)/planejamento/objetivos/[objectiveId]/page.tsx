"use client";

import { use } from "react";
import { ObjectiveDetail } from "@/components/objectives/objective-detail";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ objectiveId: string }>;
}) {
  const { objectiveId } = use(params);
  return (
    <ObjectiveDetail
      objectiveId={objectiveId as Id<"objectives">}
    />
  );
}
