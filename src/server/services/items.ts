import { CountryCode, Products } from "plaid";

import { db } from "~/server/db";
import { plaidClient } from "~/server/plaid/client";

/**
 * Creates a Plaid Link token the client uses to open Plaid Link and connect a
 * bank account.
 */
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

/**
 * Exchanges the public token returned by Plaid Link for an access token and
 * stores the resulting Item (bank connection) for the user.
 */
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
