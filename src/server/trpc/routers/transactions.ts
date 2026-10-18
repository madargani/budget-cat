import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/trpc/core";
import {
  assignTransactionCategoryInput,
  getCategoryTransactionsInput,
  getTransactionsInput,
} from "~/server/trpc/schemas/transactions";
import {
  assignTransactionCategory,
  getCategoryTransactions,
  getTransactions,
  syncTransactionsForUser,
} from "~/server/services/transactions";

export const transactionsRouter = createTRPCRouter({
  syncTransactions: protectedProcedure.mutation(async ({ ctx }) => {
    return syncTransactionsForUser(ctx.session.user.id);
  }),
  getTransactions: protectedProcedure
    .input(getTransactionsInput)
    .query(async ({ ctx, input }) => {
      return getTransactions({ userId: ctx.session.user.id, ...input });
    }),
  getByCategory: protectedProcedure
    .input(getCategoryTransactionsInput)
    .query(async ({ ctx, input }) => {
      const items = await getCategoryTransactions({
        userId: ctx.session.user.id,
        categoryId: input.categoryId,
        month: { year: input.year, month: input.month },
      });

      if (!items) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That category could not be found.",
        });
      }

      return items;
    }),
  assignCategory: protectedProcedure
    .input(assignTransactionCategoryInput)
    .mutation(async ({ ctx, input }) => {
      const updated = await assignTransactionCategory({
        userId: ctx.session.user.id,
        ...input,
      });

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The transaction or category could not be found.",
        });
      }

      return updated;
    }),
});
