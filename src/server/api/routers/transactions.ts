import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { syncTransactionsForItem } from "~/server/plaid/transactions";

const getTransactionsInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  itemId: z.string().optional(),
});

export const transactionsRouter = createTRPCRouter({
  syncTransactions: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const items = await ctx.db.item.findMany({ where: { userId } });

    const totals = { added: 0, modified: 0, removed: 0 };

    for (const item of items) {
      const counts = await syncTransactionsForItem(item.id, userId);
      totals.added += counts.added;
      totals.modified += counts.modified;
      totals.removed += counts.removed;
    }

    return totals;
  }),
  getTransactions: protectedProcedure
    .input(getTransactionsInput)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, itemId } = input;
      const userId = ctx.session.user.id;

      const items = await ctx.db.transaction.findMany({
        take: limit + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where: { userId, ...(itemId ? { itemId } : {}) },
        orderBy: [{ date: "desc" }, { id: "desc" }],
      });

      let nextCursor: string | null = null;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});