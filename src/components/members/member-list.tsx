"use client";

import { useQuery, useMutation } from "convex/react";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-fuchsia-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function MemberList() {
  const members = useQuery(api.members.getMembers);
  const deleteMember = useMutation(api.members.deleteMember);

  const handleDelete = async (id: Id<"members">) => {
    try {
      await deleteMember({ id });
      toast.success("Membro excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir membro"
      );
    }
  };

  if (members === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-muted/50 rounded-lg border" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
        <h3 className="text-lg font-semibold text-foreground">
          Nenhum membro cadastrado
        </h3>
        <p className="text-muted-foreground mt-1">
          Adicione membros para poder atribuir Key Results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const initials = getInitials(member.name);
        const colorClass = getAvatarColor(member.name);

        return (
          <div
            key={member._id}
            className="flex items-center gap-4 bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow group"
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${colorClass}`}
            >
              {initials}
            </div>

            {/* Name + date */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {member.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Cadastrado em{" "}
                {format(new Date(member.createdAt), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            {/* Delete action (hover) */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Excluir membro"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir membro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O membro será removido permanentemente. Não é possível excluir membros associados a Key Results.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(member._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
}
