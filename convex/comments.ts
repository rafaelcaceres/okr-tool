import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const getComments = query({
  args: {
    keyResultId: v.id("keyResults"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_keyResult_date", (q) =>
        q.eq("keyResultId", args.keyResultId)
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getCommentCount = query({
  args: { keyResultId: v.id("keyResults") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_keyResult", (q) =>
        q.eq("keyResultId", args.keyResultId)
      )
      .collect();
    return comments.length;
  },
});

export const addComment = mutation({
  args: {
    keyResultId: v.id("keyResults"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.keyResultId);
    if (!kr) throw new Error("Key Result não encontrado.");

    const trimmed = args.text.trim();
    if (trimmed.length === 0) {
      throw new Error("O comentário não pode estar vazio.");
    }
    if (trimmed.length > 500) {
      throw new Error("O comentário deve ter no máximo 500 caracteres.");
    }

    const now = Date.now();
    return await ctx.db.insert("comments", {
      keyResultId: args.keyResultId,
      text: trimmed,
      isRecordedDecision: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const editComment = mutation({
  args: {
    id: v.id("comments"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comentário não encontrado.");
    if (comment.isRecordedDecision) {
      throw new Error(
        "Não é possível editar um comentário marcado como decisão registrada. Desmarque a decisão primeiro."
      );
    }

    const trimmed = args.text.trim();
    if (trimmed.length === 0) {
      throw new Error("O comentário não pode estar vazio.");
    }
    if (trimmed.length > 500) {
      throw new Error("O comentário deve ter no máximo 500 caracteres.");
    }

    await ctx.db.patch(args.id, {
      text: trimmed,
      updatedAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comentário não encontrado.");
    if (comment.isRecordedDecision) {
      throw new Error(
        "Não é possível excluir um comentário marcado como decisão registrada. Desmarque a decisão primeiro."
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleDecision = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comentário não encontrado.");

    const nowMarking = !comment.isRecordedDecision;
    await ctx.db.patch(args.id, {
      isRecordedDecision: nowMarking,
      decisionMarkedAt: nowMarking ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});
