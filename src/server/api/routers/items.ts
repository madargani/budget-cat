import { CountryCode, Products } from "plaid";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { createItemFromPublicToken, plaidClient } from "~/server/plaid";

export const itemsRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const clientUserId = user.id;
    const linkTokenRequest = {
      user: {
        client_user_id: clientUserId,
      },
      client_name: "budget-cat",
      products: [Products.Auth, Products.Transactions],
      language: "en",
      country_codes: [CountryCode.Us],
    };
    try {
      const token = await plaidClient.linkTokenCreate(linkTokenRequest);
      return token.data;
    } catch (error) {
      console.log(error);
    }
  }),
  exchangePublicToken: protectedProcedure
    .input(
      z.object({
        public_token: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await createItemFromPublicToken(
          ctx.session.user.id,
          input.public_token,
        );
        return { public_token_exchange: "complete" };
      } catch (error) {
        console.log(error);
      }
    }),
});
