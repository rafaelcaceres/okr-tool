"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";

interface CommentListProps {
  keyResultId: Id<"keyResults">;
}

export function CommentList({ keyResultId }: CommentListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.comments.getComments,
    { keyResultId },
    { initialNumItems: 20 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="text-sm text-gray-400">Carregando comentários...</div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Nenhum comentário foi adicionado a este KR ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}

      {status === "CanLoadMore" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => loadMore(20)}
        >
          Carregar mais
        </Button>
      )}
      {status === "LoadingMore" && (
        <div className="text-sm text-gray-400 text-center">Carregando...</div>
      )}
    </div>
  );
}
