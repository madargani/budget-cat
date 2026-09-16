"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatTransactionAmount, formatTransactionDate } from "~/lib/format";
import { getMockCategoryGroups } from "~/lib/mock-budget";
import type { MockTransaction } from "~/lib/mock-transactions";
import { cn } from "~/lib/utils";

export function TransactionDetailDialog({
  transaction,
  onClose,
  onAssign,
}: {
  transaction: MockTransaction | null;
  onClose: () => void;
  onAssign: (id: string, category: string) => void;
}) {
  const [display, setDisplay] = useState<MockTransaction | null>(null);

  useEffect(() => {
    if (transaction) {
      setDisplay(transaction);
    }
  }, [transaction]);

  const groups = useMemo(() => {
    const base = getMockCategoryGroups();
    if (
      display?.category &&
      !base.some((group) =>
        group.categories.some((c) => c.name === display.category),
      )
    ) {
      return [
        ...base,
        {
          id: "uncategorized",
          name: "Other",
          categories: [{ id: display.category, name: display.category }],
        },
      ];
    }
    return base;
  }, [display]);

  if (!display) {
    return null;
  }

  const isSpend = display.amount < 0;

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      onAssign(display.id, value);
    }
  };

  return (
    <Dialog.Root
      open={transaction !== null}
      onOpenChange={(next) => (next ? undefined : onClose())}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="animate-in fade-in-0 data-ending-style:animate-out data-ending-style:fade-out-0 fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="bg-background animate-in fade-in-0 slide-in-from-bottom-4 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:slide-out-to-bottom-4 fixed inset-x-0 top-10 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl shadow-xl">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <Dialog.Title className="font-heading text-lg font-semibold">
              {display.name}
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <p
              className={cn(
                "font-heading text-3xl font-bold tracking-tight tabular-nums",
                isSpend ? "text-destructive" : "text-foreground",
              )}
            >
              {formatTransactionAmount(display.amount)}
            </p>

            <div className="divide-border mt-4 flex flex-col divide-y text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formatTransactionDate(display.date)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-medium">
                  {display.merchantName ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Pending</span>
                {display.pending ? (
                  <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                    Pending
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs font-medium">
                    No
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-muted-foreground text-sm font-medium">
                Category
              </p>

              <Select
                value={display.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value
                        ? (groups
                            .flatMap((group) => group.categories)
                            .find((c) => c.name === value)?.name ?? value)
                        : "Select a category"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {groups.map((group, index) => (
                    <div key={group.id}>
                      {index > 0 && <SelectSeparator />}
                      <SelectGroup>
                        <SelectLabel>{group.name}</SelectLabel>
                        {group.categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
