"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2, Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface CommentItemProps {
  comment: Doc<"comments">;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSaving, setIsSaving] = useState(false);

  const editComment = useMutation(api.comments.editComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const toggleDecision = useMutation(api.comments.toggleDecision);

  const isEdited = comment.updatedAt !== comment.createdAt;

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await editComment({ id: comment._id, text: editText });
      setEditing(false);
      toast.success("Comentário atualizado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao editar comentário"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ id: comment._id });
      toast.success("Comentário excluído");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir comentário"
      );
    }
  };

  const handleToggleDecision = async () => {
    try {
      await toggleDecision({ id: comment._id });
      toast.success(
        comment.isRecordedDecision ? "Decisão desmarcada" : "Decisão registrada"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao marcar decisão"
      );
    }
  };

  return (
    <div
      className={`rounded-md p-3 space-y-2 ${
        comment.isRecordedDecision
          ? "border-l-4 border-amber-400 bg-amber-50 border border-amber-200"
          : "bg-gray-50 border border-gray-100"
      }`}
    >
      {comment.isRecordedDecision && (
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
            Decisão Registrada
          </Badge>
          {comment.decisionMarkedAt && (
            <span className="text-xs text-amber-700">
              em{" "}
              {format(new Date(comment.decisionMarkedAt), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </span>
          )}
        </div>
      )}

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={500}
            rows={3}
            className="resize-none text-sm"
            autoFocus
          />
          <div className="flex justify-between items-center">
            <span
              className={`text-xs ${editText.length > 450 ? "text-red-500" : "text-gray-400"}`}
            >
              {editText.length}/500
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.text);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={editText.trim().length === 0 || isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {comment.text}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400 space-x-1">
          <span>
            {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
          {isEdited && !comment.isRecordedDecision && (
            <span className="italic">(editado)</span>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                comment.isRecordedDecision
                  ? "text-amber-600 hover:text-amber-800"
                  : "text-gray-400 hover:text-amber-600"
              }`}
              title={
                comment.isRecordedDecision
                  ? "Remover decisão"
                  : "Marcar como decisão"
              }
              onClick={handleToggleDecision}
            >
              {comment.isRecordedDecision ? (
                <BookmarkCheck className="h-3 w-3" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
            </Button>

            {!comment.isRecordedDecision && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                  title="Editar comentário"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-600"
                      title="Excluir comentário"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
