import { QueryCtx } from "./_generated/server";

/**
 * Check if date ranges overlap.
 * Two ranges overlap if one starts before the other ends and vice versa.
 */
export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA <= endB && startB <= endA;
}

/**
 * Validate that a cycle name is unique across all cycles.
 * Optionally exclude a specific cycle ID (for updates).
 */
export async function validateCycleNameUnique(
  ctx: QueryCtx,
  name: string,
  excludeId?: string
): Promise<void> {
  const existing = await ctx.db
    .query("cycles")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();

  if (existing && existing._id !== excludeId) {
    throw new Error(`Já existe um ciclo com o nome "${name}".`);
  }
}

/**
 * Validate that a new cycle's date range doesn't overlap with existing cycles.
 * Optionally exclude a specific cycle ID (for updates).
 */
export async function validateCycleNoOverlap(
  ctx: QueryCtx,
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<void> {
  const allCycles = await ctx.db.query("cycles").collect();

  for (const cycle of allCycles) {
    if (cycle._id === excludeId) continue;
    if (datesOverlap(startDate, endDate, cycle.startDate, cycle.endDate)) {
      throw new Error(
        `O período informado conflita com o ciclo "${cycle.name}" (${cycle.startDate} a ${cycle.endDate}).`
      );
    }
  }
}
