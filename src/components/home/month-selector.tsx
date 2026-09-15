"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "~/components/ui/button";
import { formatMonth } from "~/lib/format";
import { shiftMonth, type Month } from "~/lib/month";

export function MonthSelector({
  month,
  onChange,
}: {
  month: Month;
  onChange: (month: Month) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border bg-background p-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        <ChevronLeft />
      </Button>
      <span aria-live="polite" className="min-w-28 text-center text-sm font-semibold tabular-nums">
        {formatMonth(month)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}