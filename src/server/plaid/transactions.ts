import { db } from "~/server/db";
import { plaidClient } from "./client";

export async function syncTransactionsForItem(itemId: string, userId: string) {
  const item = await db.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  let cursor = item.transactions_cursor;
  let hasMore = true;
  const counts = { added: 0, modified: 0, removed: 0 };

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: item.accessToken,
      cursor: cursor || undefined,
    });

    const { added, modified, removed, next_cursor, has_more } = response.data;

    for (const transaction of [...added, ...modified]) {
      await db.transaction.upsert({
        where: { id: transaction.transaction_id },
        create: {
          id: transaction.transaction_id,
          accountId: transaction.account_id,
          amount: transaction.amount,
          date: new Date(transaction.date),
          name: transaction.name,
          merchantName: transaction.merchant_name ?? null,
          category: transaction.category?.[0] ?? null,
          isoCurrencyCode: transaction.iso_currency_code ?? null,
          pending: transaction.pending ?? false,
          itemId,
          userId,
        },
        update: {
          accountId: transaction.account_id,
          amount: transaction.amount,
          date: new Date(transaction.date),
          name: transaction.name,
          merchantName: transaction.merchant_name ?? null,
          category: transaction.category?.[0] ?? null,
          isoCurrencyCode: transaction.iso_currency_code ?? null,
          pending: transaction.pending ?? false,
        },
      });
    }

    if (removed.length > 0) {
      await db.transaction.deleteMany({
        where: {
          id: { in: removed.map((t) => t.transaction_id) },
          userId,
        },
      });
    }

    counts.added += added.length;
    counts.modified += modified.length;
    counts.removed += removed.length;

    cursor = next_cursor;
    hasMore = has_more;
  }

  await db.item.update({
    where: { id: itemId },
    data: { transactions_cursor: cursor },
  });

  return counts;
}