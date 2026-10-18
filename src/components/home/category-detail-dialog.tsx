"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Progress } from "@base-ui/react/progress";
import { X } from "lucide-react";

import { CategoryAllocationForm } from "~/components/home/category-allocation-form";
import { CategoryTransactionList } from "~/components/home/category-transaction-list";
import { formatCurrency } from "~/lib/format";
import { cn } from "~/lib/utils";
import { type Month } from "~/lib/month";
import { type BudgetCategory } from "~/server/trpc/schemas/budget";
import { api } from "~/trpc/react";

/**
 * The sheet that opens when a category on the home screen is tapped. Shows
 * what the category was budgeted, what it has spent, an editor for the
 * allocation, and the month's transactions behind that number.
 *
 * It's a bottom sheet built on the raw Base UI `Dialog` (matching
 * `transaction-detail-dialog.tsx`) rather than the centred shadcn `Dialog`,
 * because the body is a long scrollable column that needs a pinned header.
 *
 * `category` is passed live from the `getHome` cache rather than snapshotted,
 * so the figures update in place after an optimistic allocation write instead
 * of showing stale numbers until the sheet is reopened.
 */
export function CategoryDetailDialog({
  category,
  month,
  onClose,
  onAllocate,
  onCopyPrevious,
  isAllocating,
  isCopying,
}: {
  category: BudgetCategory | null;
  month: Month;
  onClose: () => void;
  onAllocate: (categoryId: string, amount: number) => void;
  onCopyPrevious: (categoryId: string) => void;
  isAllocating: boolean;
  isCopying: boolean;
}) {
  const { data: previous } = api.budget.getPreviousAllocation.useQuery(
    {
      categoryId: category?.id ?? "",
      year: month.year,
      month: month.month,
    },
    { enabled: !!category },
  );

  if (!category) {
    return null;
  }

  const { name, allocated, spent } = category;
  const remaining = allocated - spent;
  const over = remaining < 0;
  const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;

  return (
    <Dialog.Root
      open={category !== null}
      onOpenChange={(next) => (next ? undefined : onClose())}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="animate-in fade-in-0 data-ending-style:animate-out data-ending-style:fade-out-0 fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="bg-background animate-in fade-in-0 slide-in-from-bottom-4 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:slide-out-to-bottom-4 fixed inset-x-0 top-10 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl shadow-xl">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <Dialog.Title className="font-heading text-lg font-semibold">
              {name}
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 items-center justify-center rounded-lg transition-colors">
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-sm">Spent</p>
              <p
                className={cn(
                  "font-heading text-3xl font-bold tracking-tight tabular-nums",
                  over && "text-destructive",
                )}
              >
                {formatCurrency(spent)}
              </p>
              <p className="text-muted-foreground text-sm tabular-nums">
                of {formatCurrency(allocated)} allocated
              </p>
            </div>

            <Progress.Root value={percent} className="mt-3 w-full">
              <Progress.Track className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full">
                <Progress.Indicator
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    over ? "bg-destructive" : "bg-primary",
                  )}
                />
              </Progress.Track>
            </Progress.Root>

            <p
              className={cn(
                "mt-1.5 text-xs font-medium tabular-nums",
                over ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {over
                ? `${formatCurrency(-remaining)} over budget`
                : `${formatCurrency(remaining)} remaining`}
            </p>

            <div className="border-border mt-5 border-t pt-5">
              <CategoryAllocationForm
                allocated={allocated}
                previousMonth={previous?.available ? previous.month : null}
                previousRemaining={previous?.remaining ?? 0}
                isSaving={isAllocating}
                isCopying={isCopying}
                onSave={(amount) => onAllocate(category.id, amount)}
                onCopy={() => onCopyPrevious(category.id)}
              />
            </div>

            <div className="border-border mt-6 border-t pt-5">
              <CategoryTransactionList
                categoryId={category.id}
                month={month}
                enabled
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
