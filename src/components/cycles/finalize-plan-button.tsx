"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface FinalizePlanButtonProps {
  cycleId: Id<"cycles">;
}

export function FinalizePlanButton({ cycleId }: FinalizePlanButtonProps) {
  const finalizeCycle = useMutation(api.cycles.finalizeCycle);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const handleFinalize = async () => {
    try {
      await finalizeCycle({ id: cycleId });
      toast.success("Plano finalizado com sucesso! O ciclo está pronto para ativação.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao finalizar o plano.";
      const lines = message.split("\n").filter((l) => l.trim().length > 0);
      setValidationErrors(lines);
      setShowErrors(true);
    }
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Finalizar Plano
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Plano de OKRs?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar o plano? Após a finalização, não
              será possível adicionar, editar ou remover Objetivos e Key Results.
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize}>
              Finalizar Plano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showErrors} onOpenChange={setShowErrors}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Pendências para finalizar o plano
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-500 mb-3">
              Corrija os itens abaixo antes de finalizar:
            </p>
            <ul className="space-y-2">
              {validationErrors.map((err, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-100 rounded-md p-2.5"
                >
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span className="text-gray-700">{err}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrors(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
