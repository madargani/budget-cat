"use client";

import { Inbox, ListOrdered } from "lucide-react";
import { useMemo, useState } from "react";

import { InboxDialog } from "~/components/transactions/inbox-dialog";
import { TransactionRow } from "~/components/transactions/transaction-row";
import { Button } from "~/components/ui/button";
import { formatTransactionDate } from "~/lib/format";
import { getMockTransactions } from "~/lib/mock-transactions";

export function TransactionsScreen() {
  const [inboxOpen, setInboxOpen] = useState(false);

  const transactions = useMemo(() => getMockTransactions(), []);
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

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center gap-2 px-4 pt-3">
        <ListOrdered className="text-muted-foreground size-5" />
        <h1 className="font-heading text-xl font-semibold">Transactions</h1>
      </div>

      <div className="px-4">
        <Button
          className="w-full"
          variant="secondary"
          size="lg"
          onClick={() => setInboxOpen(true)}
        >
          <Inbox />
          Assign{" "}
          <span className="font-semibold tabular-nums">
            {unassignedCount}
          </span>{" "}
          {unassignedCount === 1 ? "transaction" : "transactions"}
        </Button>
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
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <InboxDialog open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </div>
  );
}
