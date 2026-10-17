import { db } from "~/server/db";
import { plaidClient } from "~/server/plaid/client";

/**
 * Pulls added/modified/removed transactions for a single bank connection
 * (Plaid Item) and mirrors them into the database using the cursor stored on
 * the Item. Returns how many rows were added, modified, and removed.
 */
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

  // Plaid reports outflows as positive and inflows as negative, which is the
  // opposite of this app's convention (negative = spend). Flip the sign once,
  // here, so every amount stored in the database follows the app convention.
  const toAppAmount = (plaidAmount: number) => -plaidAmount;

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
          amount: toAppAmount(transaction.amount),
          date: new Date(transaction.date),
          name: transaction.name,
          merchantName: transaction.merchant_name ?? null,
          plaidCategory: transaction.category?.[0] ?? null,
          isoCurrencyCode: transaction.iso_currency_code ?? null,
          pending: transaction.pending ?? false,
          itemId,
          userId,
        },
        update: {
          accountId: transaction.account_id,
          amount: toAppAmount(transaction.amount),
          date: new Date(transaction.date),
          name: transaction.name,
          merchantName: transaction.merchant_name ?? null,
          plaidCategory: transaction.category?.[0] ?? null,
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

export async function syncTransactionsForUser(userId: string) {
  const items = await db.item.findMany({ where: { userId } });

  const totals = { added: 0, modified: 0, removed: 0 };

  for (const item of items) {
    const counts = await syncTransactionsForItem(item.id, userId);
    totals.added += counts.added;
    totals.modified += counts.modified;
    totals.removed += counts.removed;
  }

  return totals;
}

export async function getTransactions({
  userId,
  limit,
  cursor,
  itemId,
}: {
  userId: string;
  limit: number;
  cursor?: string;
  itemId?: string;
}) {
  const items = await db.transaction.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where: { userId, ...(itemId ? { itemId } : {}) },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    include: { category: { select: { name: true } } },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return {
    items,
    nextCursor,
  };
}

/**
 * Assigns one of the user's spending categories to a transaction. Returns
 * `null` when the transaction or category doesn't belong to the user, so the
 * router can surface a NOT_FOUND without this service depending on tRPC.
 */
export async function assignTransactionCategory({
  userId,
  transactionId,
  categoryId,
}: {
  userId: string;
  transactionId: string;
  categoryId: string;
}) {
  const [category, transaction] = await Promise.all([
    db.category.findFirst({
      where: { id: categoryId, group: { userId } },
      select: { id: true },
    }),
    db.transaction.findFirst({
      where: { id: transactionId, userId },
      select: { id: true },
    }),
  ]);

  if (!category || !transaction) {
    return null;
  }

  return db.transaction.update({
    where: { id: transaction.id },
    data: { categoryId: category.id },
  });
}