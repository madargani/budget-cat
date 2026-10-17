import { TRPCError } from "@trpc/server";

import { exchangePublicTokenInput } from "~/server/trpc/schemas/items";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/core";
import {
  createItemFromPublicToken,
  createLinkToken,
} from "~/server/services/items";

export const itemsRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await createLinkToken(ctx.session.user.id);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create Plaid link token",
        cause: error,
      });
    }
  }),
  exchangePublicToken: protectedProcedure
    .input(exchangePublicTokenInput)
    .mutation(async ({ input, ctx }) => {
      try {
        await createItemFromPublicToken(
          ctx.session.user.id,
          input.public_token,
        );
        return { public_token_exchange: "complete" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to exchange Plaid public token",
          cause: error,
        });
      }
    }),
});
