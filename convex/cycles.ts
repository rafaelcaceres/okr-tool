import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateCycleNameUnique } from "./helpers";
import { cycleStatus } from "./schema";

export const getCycles = query({
  args: {},
  handler: async (ctx) => {
    const cycles = await ctx.db.query("cycles").order("desc").collect();
    return cycles;
  },
});

export const getCyclesByStatus = query({
  args: {
    status: v.union(
      v.literal("PLANEJAMENTO"),
      v.literal("FINALIZADO"),
      v.literal("ATIVO"),
      v.literal("ENCERRADO")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cycles")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getActiveCycle = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cycles")
      .withIndex("by_status", (q) => q.eq("status", "ATIVO"))
      .first();
  },
});

export const getCycle = query({
  args: { id: v.id("cycles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCycle = mutation({
  args: {
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate dates
    if (args.endDate <= args.startDate) {
      throw new Error("A data de término deve ser posterior à data de início.");
    }

    // Validate unique name
    await validateCycleNameUnique(ctx, args.name);

    // Validate no overlap - DISABLED to allow concurrent cycles (e.g. Annual + Quarterly)
    // await validateCycleNoOverlap(ctx, args.startDate, args.endDate);

    const cycleId = await ctx.db.insert("cycles", {
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "PLANEJAMENTO",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return cycleId;
  },
});

export const updateCycle = mutation({
  args: {
    id: v.id("cycles"),
    name: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    const newName = args.name ?? cycle.name;
    const newStartDate = args.startDate ?? cycle.startDate;
    const newEndDate = args.endDate ?? cycle.endDate;

    if (newEndDate <= newStartDate) {
      throw new Error("A data de término deve ser posterior à data de início.");
    }

    // Validate unique name (exclude current)
    if (args.name && args.name !== cycle.name) {
      await validateCycleNameUnique(ctx, newName, args.id);
    }

    // Validate no overlap (exclude current) - DISABLED to allow concurrent cycles
    /* if (args.startDate || args.endDate) {
      await validateCycleNoOverlap(ctx, newStartDate, newEndDate, args.id);
    } */

    await ctx.db.patch(args.id, {
      name: newName,
      startDate: newStartDate,
      endDate: newEndDate,
      updatedAt: Date.now(),
    });
  },
});

export const activateCycle = mutation({
  args: { id: v.id("cycles") },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    if (cycle.status !== "FINALIZADO") {
      throw new Error("Apenas ciclos finalizados podem ser ativados.");
    }

    // Check no other active cycle exists
    const activeCycle = await ctx.db
      .query("cycles")
      .withIndex("by_status", (q) => q.eq("status", "ATIVO"))
      .first();

    if (activeCycle) {
      throw new Error(
        `Já existe um ciclo ativo: "${activeCycle.name}". Encerre-o antes de ativar outro.`
      );
    }

    await ctx.db.patch(args.id, {
      status: "ATIVO",
      updatedAt: Date.now(),
    });
  },
});

export const closeCycle = mutation({
  args: { id: v.id("cycles") },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    if (cycle.status !== "ATIVO") {
      throw new Error("Apenas ciclos ativos podem ser encerrados.");
    }

    await ctx.db.patch(args.id, {
      status: "ENCERRADO",
      updatedAt: Date.now(),
    });
  },
});

export const finalizeCycle = mutation({
  args: { id: v.id("cycles") },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    if (cycle.status !== "PLANEJAMENTO") {
      throw new Error("Apenas ciclos em planejamento podem ser finalizados.");
    }

    // Fetch all objectives for this cycle
    const objectives = await ctx.db
      .query("objectives")
      .withIndex("by_cycle", (q) => q.eq("cycleId", args.id))
      .collect();

    if (objectives.length === 0) {
      throw new Error("Não é possível finalizar um plano sem Objetivos definidos.");
    }

    // Validate each objective has KRs, and each KR has phasing
    const errors: string[] = [];

    for (const obj of objectives) {
      const krs = await ctx.db
        .query("keyResults")
        .withIndex("by_objective", (q) => q.eq("objectiveId", obj._id))
        .collect();

      if (krs.length === 0) {
        errors.push(`Objetivo "${obj.title}" não possui Key Results.`);
        continue;
      }

      for (const kr of krs) {
        // Milestone KRs don't need phasing
        if (kr.measurementType === "MILESTONE") continue;

        const phasing = await ctx.db
          .query("phasing")
          .withIndex("by_keyResult", (q) => q.eq("keyResultId", kr._id))
          .collect();

        if (phasing.length === 0) {
          errors.push(
            `Key Result "${kr.title}" do objetivo "${obj.title}" não possui Progresso Planejado (phasing) definido.`
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    await ctx.db.patch(args.id, {
      status: "FINALIZADO",
      updatedAt: Date.now(),
    });
  },
});

export const deleteCycle = mutation({
  args: { id: v.id("cycles") },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    // Check for associated objectives
    const objectives = await ctx.db
      .query("objectives")
      .withIndex("by_cycle", (q) => q.eq("cycleId", args.id))
      .first();

    if (objectives) {
      throw new Error(
        "Não é possível excluir um ciclo que possui objetivos associados. Remova os objetivos primeiro."
      );
    }

    await ctx.db.delete(args.id);
  },
});

export const setCycleStatus = mutation({
  args: {
    id: v.id("cycles"),
    status: cycleStatus,
  },
  handler: async (ctx, args) => {
    const cycle = await ctx.db.get(args.id);
    if (!cycle) throw new Error("Ciclo não encontrado.");

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
