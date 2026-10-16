"use client";

import { useMemo } from "react";

import { api, type RouterOutputs } from "~/trpc/react";

type TransactionRecord =
  RouterOutputs["transactions"]["getTransactions"]["items"][number];

/**
 * Presentation projection of a Prisma transaction. The API returns Prisma's
 * shape (UTC `Date`, nullable category relation); the transactions UI needs a
 * `YYYY-MM-DD` date string, the assigned category name, and a derived
 * `unassigned` flag.
 */
export type TransactionItem = {
  id: string;
  name: string;
  merchantName: string | null;
  amount: number;
  date: string;
  categoryId: string | null;
  category: string | null;
  plaidCategory: string | null;
  pending: boolean;
  unassigned: boolean;
};

function toTransactionItem(record: TransactionRecord): TransactionItem {
  return {
    id: record.id,
    name: record.name,
    merchantName: record.merchantName,
    amount: record.amount,
    date: record.date.toISOString().slice(0, 10),
    categoryId: record.categoryId,
    category: record.category?.name ?? null,
    plaidCategory: record.plaidCategory,
    pending: record.pending,
    unassigned: record.categoryId === null,
  };
}

/**
 * Owns transaction server state for the transactions screen: the paginated
 * `getTransactions` query, the Plaid `syncTransactions` mutation, and the
 * `assignCategory` mutation.
 *
 * Assignment intentionally skips an optimistic cache write: rendering the new
 * category requires its name, which the id-based mutation input does not
 * carry. The dialog shows the picked category immediately, and invalidating on
 * settle converges the cache with the server.
 */
export function useTransactions() {
  const utils = api.useUtils();

  const {
    data,
    isLoading,
    isError,
  } = api.transactions.getTransactions.useQuery({});

  const transactions = useMemo(
    () => (data?.items ?? []).map(toTransactionItem),
    [data],
  );

  const syncMutation = api.transactions.syncTransactions.useMutation({
    onSuccess: () => utils.transactions.getTransactions.invalidate(),
  });

  const assignMutation = api.transactions.assignCategory.useMutation({
    onSettled: () => utils.transactions.getTransactions.invalidate(),
  });

  return {
    transactions,
    isLoading,
    isError,
    isAssigning: assignMutation.isPending,
    assignCategory: (transactionId: string, categoryId: string) =>
      assignMutation.mutate({ transactionId, categoryId }),
    syncTransactions: () => syncMutation.mutate(),
  };
}
