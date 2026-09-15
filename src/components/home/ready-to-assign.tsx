"use client";

import { formatCurrency } from "~/lib/format";
import { Card, CardContent } from "~/components/ui/card";

export function ReadyToAssign({ amount }: { amount: number }) {
  return (
    <Card className="px-4">
      <CardContent className="flex flex-col items-center gap-1 py-6 text-center">
        <p className="text-sm text-muted-foreground">Ready to assign</p>
        <p className="font-heading text-4xl font-bold tabular-nums tracking-tight">
          {formatCurrency(amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          Money available to budget this month
        </p>
      </CardContent>
    </Card>
  );
}