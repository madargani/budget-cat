import { CircleArrowDown } from "lucide-react";

import type { TransactionItem } from "~/hooks/use-transactions";
import { formatTransactionAmount } from "~/lib/format";
import { cn } from "~/lib/utils";

export function TransactionRow({
  transaction,
  onClick,
}: {
  transaction: TransactionItem;
  onClick?: () => void;
}) {
  const isSpend = transaction.amount < 0;
  const subtitle =
    transaction.merchantName ??
    transaction.category ??
    transaction.plaidCategory;

  // Read-only contexts (the category sheet's transaction list) omit `onClick`,
  // and the row drops its button affordance rather than rendering a control
  // that does nothing.
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors",
    onClick && "hover:bg-muted/60 active:bg-muted cursor-pointer",
  );

  const content = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium">{transaction.name}</p>
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {transaction.unassigned && (
            <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium">
              <CircleArrowDown className="size-3" />
              Unassigned
            </span>
          )}
          {!transaction.unassigned && transaction.pending && (
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-1.5 py-0.5 font-medium">
              Pending
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
    </>
  );

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
