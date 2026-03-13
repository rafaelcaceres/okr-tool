"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddCommentFormProps {
  keyResultId: Id<"keyResults">;
}

export function AddCommentForm({ keyResultId }: AddCommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addComment = useMutation(api.comments.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length === 0) return;
    setIsSubmitting(true);
    try {
      await addComment({ keyResultId, text });
      setText("");
      toast.success("Comentário adicionado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar comentário"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Adicione um comentário..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        rows={3}
        className="resize-none text-sm"
      />
      <div className="flex justify-between items-center">
        <span
          className={`text-xs ${text.length > 450 ? "text-red-500" : "text-gray-400"}`}
        >
          {text.length}/500
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={text.trim().length === 0 || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Comentar"}
        </Button>
      </div>
    </form>
  );
}
