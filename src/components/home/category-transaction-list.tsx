"use client";

import { Loader2, Receipt } from "lucide-react";
import { useMemo } from "react";

import { TransactionRow } from "~/components/transactions/transaction-row";
import { useCategoryTransactions } from "~/hooks/use-category-transactions";
import { formatMonth, formatTransactionDate } from "~/lib/format";
import { type Month } from "~/lib/month";

/**
 * The transactions half of the category detail sheet: everything assigned to
 * this category during the month currently on screen, newest first and
 * grouped by date the way the transactions screen does it.
 *
 * The query only runs while the sheet is open (`enabled`), so merely mounting
 * the sheet costs nothing.
 */
export function CategoryTransactionList({
  categoryId,
  month,
  enabled,
}: {
  categoryId: string;
  month: Month;
  enabled: boolean;
}) {
  const { transactions, isLoading, isError } = useCategoryTransactions({
    categoryId,
    month,
    enabled,
  });

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof transactions>();
    for (const transaction of transactions) {
      const list = groups.get(transaction.date);
      if (list) {
        list.push(transaction);
      } else {
        groups.set(transaction.date, [transaction]);
      }
    }
    return [...groups.entries()];
  }, [transactions]);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        Transactions
      </h3>

      {isLoading ? (
        <p className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading transactions…
        </p>
      ) : isError ? (
        <p className="text-destructive py-6 text-center text-sm">
          Couldn&apos;t load these transactions.
        </p>
      ) : transactions.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-1.5 rounded-xl border border-dashed py-8 text-center">
          <Receipt className="size-5" />
          <p className="text-sm font-medium">Nothing in {formatMonth(month)}</p>
          <p className="text-xs">
            Transactions you assign to this category will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {grouped.map(([date, list]) => (
            <div key={date} className="flex flex-col">
              <h4 className="text-muted-foreground py-1 text-xs font-medium">
                {formatTransactionDate(date)}
              </h4>
              <div className="divide-border flex flex-col divide-y">
                {list.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
