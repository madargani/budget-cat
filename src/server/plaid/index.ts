import { CountryCode, Products } from "plaid";

import { db } from "~/server/db";
import { plaidClient } from "./client";

export { plaidClient };

export async function createLinkToken(clientUserId: string) {
  const token = await plaidClient.linkTokenCreate({
    user: {
      client_user_id: clientUserId,
    },
    client_name: "budget-cat",
    products: [Products.Auth, Products.Transactions],
    language: "en",
    country_codes: [CountryCode.Us],
  });

  return token.data;
}

export async function createItemFromPublicToken(
  userId: string,
  publicToken: string,
) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return db.item.create({
    data: {
      id: response.data.item_id,
      transactions_cursor: "",
      accessToken: response.data.access_token,
      userId,
    },
  });
}
