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
import type { TransactionItem } from "~/hooks/use-transactions";
import { formatTransactionAmount, formatTransactionDate } from "~/lib/format";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

type CategoryGroup = RouterOutputs["budget"]["getHome"]["groups"][number];

export function TransactionDetailDialog({
  transaction,
  categoryGroups,
  onClose,
  onAssign,
}: {
  transaction: TransactionItem | null;
  categoryGroups: CategoryGroup[];
  onClose: () => void;
  onAssign: (transactionId: string, categoryId: string) => void;
}) {
  const [display, setDisplay] = useState<TransactionItem | null>(null);

  useEffect(() => {
    if (transaction) {
      setDisplay(transaction);
    }
  }, [transaction]);

  const groups = useMemo<CategoryGroup[]>(() => {
    if (
      display?.categoryId &&
      !categoryGroups.some((group) =>
        group.categories.some((category) => category.id === display.categoryId),
      )
    ) {
      return [
        ...categoryGroups,
        {
          id: "uncategorized",
          name: "Other",
          categories: [
            {
              id: display.categoryId,
              name: display.category ?? "Uncategorized",
              allocated: 0,
              spent: 0,
            },
          ],
        },
      ];
    }
    return categoryGroups;
  }, [categoryGroups, display]);

  const categories = useMemo(
    () => groups.flatMap((group) => group.categories),
    [groups],
  );

  if (!display) {
    return null;
  }

  const isSpend = display.amount < 0;

  const handleCategoryChange = (value: string | null) => {
    if (!value) return;
    const category = categories.find((item) => item.id === value);
    // Reflect the pick immediately; the assignment mutation converges the
    // server cache, which re-syncs `display` through the effect above.
    setDisplay({
      ...display,
      categoryId: value,
      category: category?.name ?? display.category,
      unassigned: false,
    });
    onAssign(display.id, value);
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
                value={display.categoryId}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value
                        ? (categories.find((category) => category.id === value)
                            ?.name ?? "Select a category")
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
                          <SelectItem key={category.id} value={category.id}>
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
