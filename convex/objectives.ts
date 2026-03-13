import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getObjective = query({
  args: { id: v.id("objectives") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getObjectives = query({
  args: {
    cycleId: v.optional(v.id("cycles")),
    franchiseId: v.optional(v.id("franchises")),
  },
  handler: async (ctx, args) => {
    if (args.franchiseId && args.cycleId) {
      return await ctx.db
        .query("objectives")
        .withIndex("by_franchise_cycle", (q) =>
          q.eq("franchiseId", args.franchiseId).eq("cycleId", args.cycleId)
        )
        .order("desc")
        .collect();
    }
    if (args.franchiseId) {
      return await ctx.db
        .query("objectives")
        .withIndex("by_franchise_cycle", (q) =>
          q.eq("franchiseId", args.franchiseId)
        )
        .order("desc")
        .collect();
    }
    if (args.cycleId) {
      return await ctx.db
        .query("objectives")
        .withIndex("by_cycle", (q) => q.eq("cycleId", args.cycleId))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("objectives").order("desc").collect();
  },
});

export const createObjective = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    cycleId: v.optional(v.id("cycles")),
    franchiseId: v.optional(v.id("franchises")),
  },
  handler: async (ctx, args) => {
    // Validate cycle exists if provided
    if (args.cycleId) {
      const cycle = await ctx.db.get(args.cycleId);
      if (!cycle) throw new Error("Ciclo não encontrado.");
    }

    // Validate title uniqueness within franchise+cycle
    if (args.cycleId && args.franchiseId) {
      const existing = await ctx.db
        .query("objectives")
        .withIndex("by_franchise_cycle", (q) =>
          q.eq("franchiseId", args.franchiseId).eq("cycleId", args.cycleId)
        )
        .collect();

      if (existing.some((o) => o.title === args.title)) {
        throw new Error("Já existe um objetivo com este título neste ciclo/franquia.");
      }
    }

    const objectiveId = await ctx.db.insert("objectives", {
      title: args.title,
      description: args.description,
      progress: 0,
      status: "NOT_STARTED",
      dueDate: args.dueDate,
      cycleId: args.cycleId,
      franchiseId: args.franchiseId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return objectiveId;
  },
});

export const updateObjective = mutation({
  args: {
    id: v.id("objectives"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const objective = await ctx.db.get(args.id);
    if (!objective) throw new Error("Objetivo não encontrado.");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (args.title.trim().length < 2) {
        throw new Error("O título deve ter pelo menos 2 caracteres.");
      }
      if (args.title.length > 250) {
        throw new Error("O título deve ter no máximo 250 caracteres.");
      }
      // Validate title uniqueness within franchise+cycle
      if (objective.cycleId && objective.franchiseId) {
        const existing = await ctx.db
          .query("objectives")
          .withIndex("by_franchise_cycle", (q) =>
            q.eq("franchiseId", objective.franchiseId).eq("cycleId", objective.cycleId)
          )
          .collect();
        if (existing.some((o) => o.title === args.title && o._id !== args.id)) {
          throw new Error("Já existe um objetivo com este título neste ciclo/franquia.");
        }
      }
      updates.title = args.title.trim();
    }

    if (args.description !== undefined) {
      if (args.description.length > 500) {
        throw new Error("A descrição deve ter no máximo 500 caracteres.");
      }
      updates.description = args.description;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const updateObjectiveStatus = mutation({
  args: {
    id: v.id("objectives"),
    status: v.union(
      v.literal("NOT_STARTED"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("AT_RISK"),
      v.literal("LATE")
    ),
  },
  handler: async (ctx, args) => {
    const objective = await ctx.db.get(args.id);
    if (!objective) throw new Error("Objetivo não encontrado.");

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateObjectiveDescription = mutation({
  args: {
    id: v.id("objectives"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const objective = await ctx.db.get(args.id);
    if (!objective) throw new Error("Objetivo não encontrado.");

    if (args.description.length > 500) {
      throw new Error("A descrição deve ter no máximo 500 caracteres.");
    }

    await ctx.db.patch(args.id, {
      description: args.description,
      updatedAt: Date.now(),
    });
  },
});

export const deleteObjective = mutation({
  args: { id: v.id("objectives") },
  handler: async (ctx, args) => {
    const objective = await ctx.db.get(args.id);
    if (!objective) throw new Error("Objetivo não encontrado.");

    // Get all key results for cascade delete
    const keyResults = await ctx.db
      .query("keyResults")
      .withIndex("by_objective", (q) => q.eq("objectiveId", args.id))
      .collect();

    // Cascade delete key results and related data
    for (const kr of keyResults) {
      // Delete phasing entries
      const phasingEntries = await ctx.db
        .query("phasing")
        .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
        .collect();
      for (const p of phasingEntries) {
        await ctx.db.delete(p._id);
      }

      // Delete milestones
      const milestones = await ctx.db
        .query("milestones")
        .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
        .collect();
      for (const m of milestones) {
        await ctx.db.delete(m._id);
      }

      // Delete comments
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
        .collect();
      for (const c of comments) {
        await ctx.db.delete(c._id);
      }

      await ctx.db.delete(kr._id);
    }

    await ctx.db.delete(args.id);
  },
});
