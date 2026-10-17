import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/trpc/core";
import {
  assignTransactionCategoryInput,
  getTransactionsInput,
} from "~/server/trpc/schemas/transactions";
import {
  assignTransactionCategory,
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