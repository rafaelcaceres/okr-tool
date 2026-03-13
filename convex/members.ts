import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("members").order("asc").collect();
  },
});

export const createMember = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("O nome não pode ser vazio.");

    const existing = await ctx.db
      .query("members")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existing) {
      throw new Error("Já existe um membro com este nome.");
    }

    return await ctx.db.insert("members", {
      name,
      createdAt: Date.now(),
    });
  },
});

export const deleteMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Membro não encontrado.");

    // Check if member is assigned to any KR
    const allKRs = await ctx.db.query("keyResults").collect();
    const assigned = allKRs.some(
      (kr) => kr.responsibles && kr.responsibles.includes(args.id)
    );

    if (assigned) {
      throw new Error(
        "Não é possível excluir um membro que está associado a Key Results. Remova-o dos KRs primeiro."
      );
    }

    await ctx.db.delete(args.id);
  },
});
