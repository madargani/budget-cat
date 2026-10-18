"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

import { AddBudgetItem } from "~/components/home/add-budget-item";
import { CategoryDetailDialog } from "~/components/home/category-detail-dialog";
import { CategoryGroups } from "~/components/home/category-groups";
import { HomeHeader } from "~/components/home/home-header";
import { ReadyToAssign } from "~/components/home/ready-to-assign";
import { PlaidLink } from "~/components/bank/plaid-link";
import { TransactionsTester } from "~/components/bank/transactions-tester";
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
  // Holds the id rather than the category object so the sheet always reads the
  // live row out of the query cache and re-renders when it changes.
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const {
    budget,
    isLoading,
    isError,
    addGroup,
    addCategory,
    allocate,
    copyPreviousAllocation,
    isAllocating,
    isCopying,
  } = useBudget(month);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    for (const group of budget?.groups ?? []) {
      const match = group.categories.find(
        (category) => category.id === selectedCategoryId,
      );
      if (match) return match;
    }
    return null;
  }, [budget, selectedCategoryId]);

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
            <CategoryGroups
              groups={budget.groups}
              onSelectCategory={(category) =>
                setSelectedCategoryId(category.id)
              }
            />
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

          <CategoryDetailDialog
            category={selectedCategory}
            month={month}
            onClose={() => setSelectedCategoryId(null)}
            onAllocate={allocate}
            onCopyPrevious={copyPreviousAllocation}
            isAllocating={isAllocating}
            isCopying={isCopying}
          />
        </>
      )}
    </div>
  );
}
