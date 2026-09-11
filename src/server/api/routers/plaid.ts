import { CountryCode, Products } from "plaid";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { plaidClient } from "~/server/plaid";

export const plaidRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const clientUserId = user.id;
    const linkTokenRequest = {
      user: {
        client_user_id: clientUserId,
      },
      client_name: "budget-cat",
      products: [Products.Auth],
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
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: input.public_token,
        });
        console.log(response.data);
        return { public_token_exchange: "complete" };
      } catch (error) {
        console.log(error);
      }
    }),
});
