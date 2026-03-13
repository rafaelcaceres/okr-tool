"use client";

import { ProgressUpdateView } from "@/components/progress/progress-update-view";

export default function ProgressoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Atualização de Progresso
        </h1>
        <p className="text-muted-foreground">
          Atualize o progresso dos Key Results dos ciclos ativos.
        </p>
      </div>

      <ProgressUpdateView />
    </div>
  );
}
