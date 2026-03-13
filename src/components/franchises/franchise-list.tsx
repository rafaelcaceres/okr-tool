"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import { EditFranchiseDialog } from "./edit-franchise-dialog";
import { Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FranchiseList() {
  const franchises = useQuery(api.franchises.getFranchises);
  const deleteFranchise = useMutation(api.franchises.deleteFranchise);

  const handleDelete = async (id: Id<"franchises">) => {
    try {
      await deleteFranchise({ id });
      toast.success("Franquia excluída");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir franquia"
      );
    }
  };

  if (franchises === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse bg-muted/50 rounded-lg border" />
        ))}
      </div>
    );
  }

  if (franchises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground">
          Nenhuma franquia encontrada
        </h3>
        <p className="text-muted-foreground mt-1">
          Crie uma franquia para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {franchises.map((franchise: Doc<"franchises">) => (
        <div
          key={franchise._id}
          className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow group"
        >
          {/* Icon + Name */}
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {franchise.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(franchise.createdAt), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 border-t pt-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditFranchiseDialog franchise={franchise} />
            <div className="flex-1" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label="Excluir franquia"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir franquia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A franquia será
                    removida permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(franchise._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
