import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getFranchise = query({
  args: { id: v.id("franchises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFranchises = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("franchises").order("desc").collect();
  },
});

export const updateFranchise = mutation({
  args: {
    id: v.id("franchises"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.id);
    if (!franchise) throw new Error("Franquia não encontrada.");

    if (args.name.trim().length < 2) {
      throw new Error("O nome deve ter pelo menos 2 caracteres.");
    }

    const existing = await ctx.db
      .query("franchises")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error(`Já existe uma franquia com o nome "${args.name}".`);
    }

    await ctx.db.patch(args.id, { name: args.name.trim() });
  },
});

export const deleteFranchise = mutation({
  args: { id: v.id("franchises") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.id);
    if (!franchise) throw new Error("Franquia não encontrada.");

    // Check if franchise has objectives
    const objectives = await ctx.db
      .query("objectives")
      .withIndex("by_franchise_cycle", (q) => q.eq("franchiseId", args.id))
      .first();

    if (objectives) {
      throw new Error(
        "Não é possível excluir uma franquia que possui objetivos associados."
      );
    }

    await ctx.db.delete(args.id);
  },
});

export const createFranchise = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("franchises")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error(`Já existe uma franquia com o nome "${args.name}".`);
    }

    return await ctx.db.insert("franchises", {
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
