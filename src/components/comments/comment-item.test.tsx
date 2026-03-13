import { render, screen } from "@testing-library/react";
import { CommentItem } from "./comment-item";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Doc } from "../../../convex/_generated/dataModel";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

vi.mock("../../../convex/_generated/api", () => ({
  api: {
    comments: {
      editComment: "editComment",
      deleteComment: "deleteComment",
      toggleDecision: "toggleDecision",
    },
  },
}));

const baseComment: Doc<"comments"> = {
  _id: "c1" as Doc<"comments">["_id"],
  _creationTime: Date.now(),
  keyResultId: "kr1" as Doc<"comments">["keyResultId"],
  text: "Este é um comentário de teste",
  isRecordedDecision: false,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe("CommentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders comment text", () => {
    render(<CommentItem comment={baseComment} />);
    expect(
      screen.getByText("Este é um comentário de teste")
    ).toBeInTheDocument();
  });

  it("renders edit and delete buttons for normal comments", () => {
    render(<CommentItem comment={baseComment} />);
    expect(screen.getByTitle("Editar comentário")).toBeInTheDocument();
    expect(screen.getByTitle("Excluir comentário")).toBeInTheDocument();
  });

  it("renders decision badge when marked as decision", () => {
    const decisionComment = {
      ...baseComment,
      isRecordedDecision: true,
      decisionMarkedAt: 1700000100000,
    };
    render(<CommentItem comment={decisionComment} />);
    expect(screen.getByText("Decisão Registrada")).toBeInTheDocument();
  });

  it("hides edit and delete buttons when marked as decision", () => {
    const decisionComment = {
      ...baseComment,
      isRecordedDecision: true,
      decisionMarkedAt: 1700000100000,
    };
    render(<CommentItem comment={decisionComment} />);
    expect(screen.queryByTitle("Editar comentário")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Excluir comentário")).not.toBeInTheDocument();
  });

  it("shows toggle decision button regardless of state", () => {
    render(<CommentItem comment={baseComment} />);
    expect(screen.getByTitle("Marcar como decisão")).toBeInTheDocument();

    const decisionComment = {
      ...baseComment,
      isRecordedDecision: true,
      decisionMarkedAt: 1700000100000,
    };
    const { unmount } = render(<CommentItem comment={decisionComment} />);
    expect(screen.getByTitle("Remover decisão")).toBeInTheDocument();
    unmount();
  });

  it("shows edited label when updatedAt differs from createdAt", () => {
    const editedComment = {
      ...baseComment,
      updatedAt: 1700000200000,
    };
    render(<CommentItem comment={editedComment} />);
    expect(screen.getByText("(editado)")).toBeInTheDocument();
  });

  it("does not show edited label when timestamps match", () => {
    render(<CommentItem comment={baseComment} />);
    expect(screen.queryByText("(editado)")).not.toBeInTheDocument();
  });
});
