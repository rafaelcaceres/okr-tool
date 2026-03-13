"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditCycleDialog } from "./edit-cycle-dialog";
import { FinalizePlanButton } from "./finalize-plan-button";
import { Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<
  Doc<"cycles">["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PLANEJAMENTO: { label: "Planejamento", variant: "outline" },
  FINALIZADO: { label: "Finalizado", variant: "secondary" },
  ATIVO: { label: "Ativo", variant: "default" },
  ENCERRADO: { label: "Encerrado", variant: "destructive" },
};

const statusOptions = [
  { value: "PLANEJAMENTO", label: "Planejamento" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "ATIVO", label: "Ativo" },
  { value: "ENCERRADO", label: "Encerrado" },
] as const;

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy", { locale: ptBR });
}

export function CycleList() {
  const cycles = useQuery(api.cycles.getCycles);
  const deleteCycle = useMutation(api.cycles.deleteCycle);
  const setCycleStatus = useMutation(api.cycles.setCycleStatus);

  const handleDelete = async (id: Id<"cycles">) => {
    try {
      await deleteCycle({ id });
      toast.success("Ciclo excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir ciclo"
      );
    }
  };

  const handleStatusChange = async (id: Id<"cycles">, status: Doc<"cycles">["status"]) => {
    try {
      await setCycleStatus({ id, status });
      toast.success(`Status alterado para ${statusConfig[status].label}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao alterar status"
      );
    }
  };

  if (cycles === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse bg-muted/50 rounded-lg border" />
        ))}
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground">Nenhum ciclo encontrado</h3>
        <p className="text-muted-foreground mt-1">Crie um ciclo para começar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cycles.map((cycle: Doc<"cycles">) => {
        const { label, variant } = statusConfig[cycle.status];

        return (
          <div
            key={cycle._id}
            className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow group"
          >
            {/* Header: Name + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-foreground line-clamp-2">
                {cycle.name}
              </h3>
              <Badge variant={variant} className="shrink-0 text-[11px]">
                {label}
              </Badge>
            </div>

            {/* Period */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
              </span>
            </div>

            {/* Status selector */}
            <div className="mb-3">
              <Select
                value={cycle.status}
                onValueChange={(value) =>
                  handleStatusChange(cycle._id, value as Doc<"cycles">["status"])
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge
                        variant={statusConfig[option.value].variant}
                        className="pointer-events-none"
                      >
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 border-t pt-3">
              <EditCycleDialog cycle={cycle} />
              {cycle.status === "PLANEJAMENTO" && (
                <FinalizePlanButton cycleId={cycle._id} />
              )}
              <div className="flex-1" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Excluir ciclo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir ciclo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O ciclo e todos os dados associados podem ser afetados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(cycle._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}
