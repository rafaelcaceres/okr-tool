import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMilestones = query({
  args: { keyResultId: v.id("keyResults") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("milestones")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.keyResultId))
      .collect()
      .then((milestones) => milestones.sort((a, b) => a.order - b.order));
  },
});

export const createMilestone = mutation({
  args: {
    keyResultId: v.id("keyResults"),
    description: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.keyResultId);
    if (!kr) throw new Error("Key Result não encontrado.");
    if (kr.measurementType !== "MILESTONE") {
      throw new Error("Marcos só podem ser adicionados a KRs do tipo Marco.");
    }
    if (args.description.trim().length === 0) {
      throw new Error("A descrição do marco é obrigatória.");
    }

    return await ctx.db.insert("milestones", {
      keyResultId: args.keyResultId,
      description: args.description.trim(),
      completed: false,
      order: args.order,
      updatedAt: Date.now(),
    });
  },
});

export const updateMilestone = mutation({
  args: {
    id: v.id("milestones"),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const milestone = await ctx.db.get(args.id);
    if (!milestone) throw new Error("Marco não encontrado.");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.description !== undefined) {
      if (args.description.trim().length === 0) {
        throw new Error("A descrição do marco é obrigatória.");
      }
      updates.description = args.description.trim();
    }
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args.id, updates);
  },
});

export const toggleMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, args) => {
    const milestone = await ctx.db.get(args.id);
    if (!milestone) throw new Error("Marco não encontrado.");

    await ctx.db.patch(args.id, {
      completed: !milestone.completed,
      updatedAt: Date.now(),
    });

    // Recalculate KR progress based on completed milestones
    const kr = await ctx.db.get(milestone.keyResultId);
    if (!kr) return;

    const allMilestones = await ctx.db
      .query("milestones")
      .withIndex("by_keyResult", (q) =>
        q.eq("keyResultId", milestone.keyResultId)
      )
      .collect();

    if (allMilestones.length === 0) return;

    // After toggle, update the count
    const completedCount = allMilestones.filter((m) =>
      m._id === args.id ? !milestone.completed : m.completed
    ).length;

    await ctx.db.patch(milestone.keyResultId, {
      currentValue: completedCount,
      hasProgress: completedCount > 0,
      updatedAt: Date.now(),
    });

    // Create progress entry
    await ctx.db.insert("progressEntries", {
      keyResultId: milestone.keyResultId,
      value: completedCount,
      recordedAt: Date.now(),
      source: "MANUAL",
    });

    // Recalculate objective progress
    const allKRs = await ctx.db
      .query("keyResults")
      .withIndex("by_objective", (q) => q.eq("objectiveId", kr.objectiveId))
      .collect();

    const krsWithUpdate = allKRs.map((k) =>
      k._id === milestone.keyResultId
        ? { ...k, currentValue: completedCount }
        : k
    );

    const sumProgress = krsWithUpdate.reduce((acc, k) => {
      const range = Math.abs(k.targetValue - k.initialValue);
      if (range === 0) return acc;
      const p =
        k.direction === "DECREASING"
          ? ((k.initialValue - k.currentValue) /
              (k.initialValue - k.targetValue)) *
            100
          : ((k.currentValue - k.initialValue) /
              (k.targetValue - k.initialValue)) *
            100;
      return acc + Math.min(100, Math.max(0, p));
    }, 0);

    await ctx.db.patch(kr.objectiveId, {
      progress: Math.round(sumProgress / krsWithUpdate.length),
      updatedAt: Date.now(),
    });
  },
});

export const deleteMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, args) => {
    const milestone = await ctx.db.get(args.id);
    if (!milestone) throw new Error("Marco não encontrado.");

    // Check if KR has progress recorded - block deletion if so
    const kr = await ctx.db.get(milestone.keyResultId);
    if (kr?.hasProgress) {
      throw new Error(
        "Não é possível excluir marcos de um KR com progresso registrado."
      );
    }

    await ctx.db.delete(args.id);
  },
});
