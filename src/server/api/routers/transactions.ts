import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { getTransactionsInput } from "~/server/api/schemas/transactions";
import {
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
});