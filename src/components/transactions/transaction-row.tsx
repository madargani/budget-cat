import { CircleArrowDown } from "lucide-react";

import { formatTransactionAmount } from "~/lib/format";
import type { MockTransaction } from "~/lib/mock-transactions";
import { cn } from "~/lib/utils";

export function TransactionRow({
  transaction,
}: {
  transaction: MockTransaction;
}) {
  const isSpend = transaction.amount < 0;
  const subtitle = transaction.merchantName ?? transaction.category;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium">{transaction.name}</p>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {transaction.unassigned && (
            <span className="text-primary flex items-center gap-1">
              <CircleArrowDown className="size-3" />
              Unassigned
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-medium tabular-nums",
          isSpend ? "text-destructive" : "text-foreground",
        )}
      >
        {formatTransactionAmount(transaction.amount)}
      </p>
    </div>
  );
}
