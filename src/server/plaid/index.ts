import { db } from "~/server/db";
import { plaidClient } from "./client";

export { plaidClient };

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
