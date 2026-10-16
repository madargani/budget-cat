"use client";

import { Check, Inbox, ListOrdered } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "~/components/layout/page-header";
import { TransactionDetailDialog } from "~/components/transactions/transaction-detail-dialog";
import { TransactionRow } from "~/components/transactions/transaction-row";
import { useBudget } from "~/hooks/use-budget";
import { useTransactions } from "~/hooks/use-transactions";
import { formatTransactionDate } from "~/lib/format";
import { cn } from "~/lib/utils";

export function TransactionsScreen({
  user,
}: {
  user: { name: string; email: string };
}) {
  const { transactions, isLoading, isError, assignCategory } =
    useTransactions();
  const { budget } = useBudget();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTransaction = useMemo(
    () =>
      transactions.find((transaction) => transaction.id === selectedId) ?? null,
    [transactions, selectedId],
  );

  const unassignedCount = transactions.filter(
    (transaction) => transaction.unassigned,
  ).length;

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

  const allCaughtUp = unassignedCount === 0;

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader icon={ListOrdered} title="Transactions" user={user} />

      {isLoading || isError ? (
        <p
          className={cn(
            "px-4 text-sm",
            isError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {isError ? "Unable to load transactions." : "Loading transactions…"}
        </p>
      ) : (
        <>
          <div className="px-4">
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
                allCaughtUp
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {allCaughtUp ? (
                <Check className="size-4" />
              ) : (
                <Inbox className="size-4" />
              )}
              {allCaughtUp
                ? "All caught up!"
                : `${unassignedCount} ${
                    unassignedCount === 1 ? "transaction" : "transactions"
                  } to assign`}
            </div>
          </div>

          <section className="flex flex-col gap-5 px-4">
            {grouped.map(([date, list]) => (
              <div key={date} className="flex flex-col">
                <h2 className="text-muted-foreground text-sm font-medium">
                  {formatTransactionDate(date)}
                </h2>
                <div className="divide-border flex flex-col divide-y">
                  {list.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => setSelectedId(transaction.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <TransactionDetailDialog
        transaction={selectedTransaction}
        categoryGroups={budget?.groups ?? []}
        onClose={() => setSelectedId(null)}
        onAssign={assignCategory}
      />
    </div>
  );
}
