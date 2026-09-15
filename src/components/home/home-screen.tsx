"use client";

import { useMemo, useState } from "react";

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
import { getMockBudget } from "~/lib/mock-budget";
import { currentMonth, type Month } from "~/lib/month";

export function HomeScreen({
  user,
}: {
  user: { name: string; email: string };
}) {
  const [month, setMonth] = useState<Month>(() => currentMonth());
  const budget = useMemo(() => getMockBudget(month), [month]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <HomeHeader user={user} month={month} onMonthChange={setMonth} />
      <div className="px-4">
        <ReadyToAssign amount={budget.readyToAssign} />
      </div>
      <CategoryGroups groups={budget.groups} />
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