"use client";

import { Progress } from "@base-ui/react/progress";

import { Card, CardContent } from "~/components/ui/card";
import { formatCurrency } from "~/lib/format";
import type { BudgetCategory } from "~/lib/mock-budget";
import { cn } from "~/lib/utils";

export function CategoryCard({ category }: { category: BudgetCategory }) {
  const { name, allocated, spent } = category;
  const remaining = allocated - spent;
  const over = remaining < 0;
  const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            Spent {formatCurrency(spent)} of {formatCurrency(allocated)}
          </p>
        </div>
        <Progress.Root value={percent} className="w-full">
          <Progress.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <Progress.Indicator
              className={cn(
                "h-full rounded-full transition-all duration-300",
                over ? "bg-destructive" : "bg-primary"
              )}
            />
          </Progress.Track>
        </Progress.Root>
        <p
          className={cn(
            "self-end text-xs font-medium tabular-nums",
            over ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {over
            ? `${formatCurrency(-remaining)} over`
            : `${formatCurrency(remaining)} remaining`}
        </p>
      </CardContent>
    </Card>
  );
}