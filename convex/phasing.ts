import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPhasing = query({
  args: { keyResultId: v.id("keyResults") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("phasing")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.keyResultId))
      .collect();
  },
});

export const savePhasing = mutation({
  args: {
    keyResultId: v.id("keyResults"),
    planningFrequency: v.optional(v.union(v.literal("MONTHLY"), v.literal("WEEKLY"), v.literal("QUARTERLY"))),
    entries: v.array(
      v.object({
        date: v.string(),
        plannedValue: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.keyResultId);
    if (!kr) throw new Error("Key Result não encontrado.");

    if (kr.measurementType === "MILESTONE") {
      throw new Error("Phasing não se aplica a Key Results do tipo Marco.");
    }

    // Update planning frequency if provided
    if (args.planningFrequency) {
      await ctx.db.patch(args.keyResultId, {
        planningFrequency: args.planningFrequency,
        updatedAt: Date.now(),
      });
    }

    // Validate non-negative values
    for (const entry of args.entries) {
      if (entry.plannedValue < 0) {
        throw new Error("Os valores de meta devem ser não negativos.");
      }
    }

    // Validate sum equals target range (only for cumulative phasing modes)
    const cumulativeTypes = ["CUMULATIVE_NUMERIC", "PROGRESSIVE_PERCENTAGE"];
    if (!kr.krType || cumulativeTypes.includes(kr.krType)) {
      const expectedTotal = Math.abs(kr.targetValue - kr.initialValue);
      const actualSum = args.entries.reduce((sum, e) => sum + e.plannedValue, 0);

      // Use small epsilon for float comparison
      if (Math.abs(actualSum - expectedTotal) > 0.01) {
        throw new Error(
          `A soma das metas (${actualSum}) deve ser igual à meta total do KR (${expectedTotal}).`
        );
      }
    }

    // Delete existing phasing entries
    const existing = await ctx.db
      .query("phasing")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.keyResultId))
      .collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }

    // Insert new entries
    const now = Date.now();
    for (const entry of args.entries) {
      await ctx.db.insert("phasing", {
        keyResultId: args.keyResultId,
        date: entry.date,
        plannedValue: entry.plannedValue,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const deletePhasing = mutation({
  args: { keyResultId: v.id("keyResults") },
  handler: async (ctx, args) => {
    const kr = await ctx.db.get(args.keyResultId);
    if (!kr) throw new Error("Key Result não encontrado.");

    const entries = await ctx.db
      .query("phasing")
      .withIndex("by_keyResult", (q) => q.eq("keyResultId", args.keyResultId))
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
  },
});
