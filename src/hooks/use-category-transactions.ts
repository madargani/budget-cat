"use client";

import { useMemo } from "react";

import { toTransactionItem } from "~/hooks/use-transactions";
import { type Month } from "~/lib/month";
import { api } from "~/trpc/react";

/**
 * Loads one category's transactions for a single month, backing the category
 * detail sheet. The query stays disabled until `enabled` is true so opening
 * the sheet is what triggers the fetch — without it, every mounted sheet
 * would fire a request for a month the user never looked at.
 *
 * Scoped to the month that the sheet is showing so the rows reconcile with
 * the `spent` total rendered beside them.
 */
export function useCategoryTransactions({
  categoryId,
  month,
  enabled,
}: {
  categoryId: string | null;
  month: Month;
  enabled: boolean;
}) {
  const input = {
    categoryId: categoryId ?? "",
    year: month.year,
    month: month.month,
  };

  const { data, isLoading, isError } = api.transactions.getByCategory.useQuery(
    input,
    { enabled: enabled && !!categoryId },
  );

  const transactions = useMemo(
    () => (data ?? []).map(toTransactionItem),
    [data],
  );

  return {
    transactions,
    isLoading: enabled && isLoading,
    isError: enabled && isError,
  };
}
