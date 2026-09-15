"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Inbox, X } from "lucide-react";

import { TransactionRow } from "~/components/transactions/transaction-row";
import { getUnassignedTransactions } from "~/lib/mock-transactions";

export function InboxDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const transactions = getUnassignedTransactions();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => (next ? undefined : onClose())}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="animate-in fade-in-0 data-ending-style:animate-out data-ending-style:fade-out-0 fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="bg-background animate-in fade-in-0 slide-in-from-bottom-4 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:slide-out-to-bottom-4 fixed inset-x-0 top-10 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl shadow-xl">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <Dialog.Title className="font-heading text-lg font-semibold">
              Assign transactions
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 pt-16 text-center">
                <Inbox className="text-muted-foreground size-8" />
                <p className="text-sm font-medium">
                  No unassigned transactions!
                </p>
                <p className="text-muted-foreground text-xs">
                  Everything in your inbox has been assigned.
                </p>
              </div>
            ) : (
              <div className="divide-border flex flex-col divide-y">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
