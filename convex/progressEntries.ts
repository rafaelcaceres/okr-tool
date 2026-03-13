import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProgressEntries = query({
  args: { keyResultId: v.id("keyResults") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progressEntries")
      .withIndex("by_keyResult_date", (q) =>
        q.eq("keyResultId", args.keyResultId)
      )
      .order("desc")
      .collect();
  },
});
