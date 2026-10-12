"use client";

import { useMemo, useState } from "react";

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
import {
  getMockBudget,
  type BudgetCategory,
  type CategoryGroup,
} from "~/lib/mock-budget";
import { currentMonth, type Month } from "~/lib/month";

export function HomeScreen({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [month, setMonth] = useState<Month>(() => currentMonth());
  const budget = useMemo(() => getMockBudget(month), [month]);

  const [customGroups, setCustomGroups] = useState<CategoryGroup[]>([]);
  const [customCategories, setCustomCategories] = useState<
    { groupId: string; category: BudgetCategory }[]
  >([]);

  const groups = useMemo(() => {
    const categoriesByGroup = new Map<string, BudgetCategory[]>();
    for (const { groupId, category } of customCategories) {
      const list = categoriesByGroup.get(groupId) ?? [];
      list.push(category);
      categoriesByGroup.set(groupId, list);
    }

    return [
      ...budget.groups.map((group) => ({
        ...group,
        categories: [
          ...group.categories,
          ...(categoriesByGroup.get(group.id) ?? []),
        ],
      })),
      ...customGroups,
    ];
  }, [budget, customCategories, customGroups]);

  const handleAddGroup = (name: string) => {
    setCustomGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, categories: [] },
    ]);
  };

  const handleAddCategory = (groupId: string, name: string) => {
    setCustomCategories((prev) => [
      ...prev,
      {
        groupId,
        category: {
          id: crypto.randomUUID(),
          name,
          allocated: 0,
          spent: 0,
        },
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <HomeHeader user={user} month={month} onMonthChange={setMonth} />
      <div className="flex flex-col gap-2 px-4">
        <ReadyToAssign amount={budget.readyToAssign} />
        <div className="flex justify-end">
          <AddBudgetItem
            groups={groups}
            onAddGroup={handleAddGroup}
            onAddCategory={handleAddCategory}
          />
        </div>
      </div>
      <CategoryGroups groups={groups} />
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
    </div>
  );
}
