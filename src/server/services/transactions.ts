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