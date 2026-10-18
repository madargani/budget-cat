"use client";

import { Progress } from "@base-ui/react/progress";

import { Card, CardContent } from "~/components/ui/card";
import { formatCurrency } from "~/lib/format";
import { cn } from "~/lib/utils";
import type { BudgetCategory } from "~/server/trpc/schemas/budget";

export function CategoryCard({
  category,
  onSelect,
}: {
  category: BudgetCategory;
  onSelect?: () => void;
}) {
  const { name, allocated, spent } = category;
  const remaining = allocated - spent;
  const over = remaining < 0;
  const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;

  const body = (
    <CardContent className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          Spent {formatCurrency(spent)} of {formatCurrency(allocated)}
        </p>
      </div>
      <Progress.Root value={percent} className="w-full">
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
          "self-end text-xs font-medium tabular-nums",
          over ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {over
          ? `${formatCurrency(-remaining)} over`
          : `${formatCurrency(remaining)} remaining`}
      </p>
    </CardContent>
  );

  // Tapping a category opens its detail sheet, so the whole card acts as the
  // trigger. `onSelect` is optional to keep the card usable as a static
  // summary wherever no handler is wired up.
  if (!onSelect) {
    return <Card size="sm">{body}</Card>;
  }

  return (
    <Card
      size="sm"
      className="hover:bg-muted/60 active:bg-muted transition-colors"
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left"
        aria-label={`View details for ${name}`}
      >
        {body}
      </button>
    </Card>
  );
}
