import { render, screen } from "@testing-library/react";
import { CommentList } from "./comment-list";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Id } from "../../../convex/_generated/dataModel";

const mockUsePaginatedQuery = vi.fn();

vi.mock("convex/react", () => ({
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

vi.mock("../../../convex/_generated/api", () => ({
  api: {
    comments: {
      getComments: "getComments",
    },
  },
}));

vi.mock("./comment-item", () => ({
  CommentItem: ({ comment }: { comment: { text: string } }) => (
    <div data-testid="comment-item">{comment.text}</div>
  ),
}));

const mockKrId = "kr123" as Id<"keyResults">;

describe("CommentList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "LoadingFirstPage",
      loadMore: vi.fn(),
    });
    render(<CommentList keyResultId={mockKrId} />);
    expect(screen.getByText("Carregando comentários...")).toBeInTheDocument();
  });

  it("renders empty state when no comments", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
    render(<CommentList keyResultId={mockKrId} />);
    expect(
      screen.getByText(
        "Nenhum comentário foi adicionado a este KR ainda."
      )
    ).toBeInTheDocument();
  });

  it("renders comment items", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          _id: "c1",
          text: "Primeiro comentário",
          isRecordedDecision: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "c2",
          text: "Segundo comentário",
          isRecordedDecision: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
    render(<CommentList keyResultId={mockKrId} />);
    expect(screen.getAllByTestId("comment-item")).toHaveLength(2);
    expect(screen.getByText("Primeiro comentário")).toBeInTheDocument();
    expect(screen.getByText("Segundo comentário")).toBeInTheDocument();
  });

  it("renders load more button when more comments available", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          _id: "c1",
          text: "Um comentário",
          isRecordedDecision: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      status: "CanLoadMore",
      loadMore: vi.fn(),
    });
    render(<CommentList keyResultId={mockKrId} />);
    expect(screen.getByText("Carregar mais")).toBeInTheDocument();
  });

  it("does not render load more button when all loaded", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          _id: "c1",
          text: "Um comentário",
          isRecordedDecision: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
    render(<CommentList keyResultId={mockKrId} />);
    expect(screen.queryByText("Carregar mais")).not.toBeInTheDocument();
  });
});
