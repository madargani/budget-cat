"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { AddBudgetItem } from "~/components/home/add-budget-item";
import { CategoryGroups } from "~/components/home/category-groups";
import { HomeHeader } from "~/components/home/home-header";
import { ReadyToAssign } from "~/components/home/ready-to-assign";
import { PlaidLink } from "~/components/plaid-link";
import { TransactionsTester } from "~/components/transactions-tester";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useBudget } from "~/hooks/use-budget";
import { currentMonth, type Month } from "~/lib/month";

export function HomeScreen({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [month, setMonth] = useState<Month>(() => currentMonth());
  const { budget, isLoading, isError, addGroup, addCategory } = useBudget();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <HomeHeader user={user} month={month} onMonthChange={setMonth} />
      {isLoading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading budget…
        </div>
      ) : isError || !budget ? (
        <div className="text-destructive flex items-center justify-center gap-2 px-4 py-16 text-sm">
          <TriangleAlert className="size-4" />
          Couldn&apos;t load your budget.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 px-4">
            <ReadyToAssign amount={budget.readyToAssign} />
            <div className="flex justify-end">
              <AddBudgetItem
                groups={budget.groups}
                onAddGroup={addGroup}
                onAddCategory={addCategory}
              />
            </div>
          </div>

          {budget.groups.length > 0 ? (
            <CategoryGroups groups={budget.groups} />
          ) : (
            <p className="text-muted-foreground px-4 text-sm">
              No categories yet. Add a category group to get started.
            </p>
          )}

          <Card className="mx-4">
            <CardHeader>
              <CardTitle>Account &amp; bank</CardTitle>
              <CardDescription>
                Temporary tools while the app is built out.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <PlaidLink />
              <TransactionsTester />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
