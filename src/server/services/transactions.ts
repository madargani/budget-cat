import { db } from "~/server/db";
import { syncTransactionsForItem } from "~/server/plaid/transactions";

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