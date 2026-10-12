"use client";

import { House } from "lucide-react";

import { MonthSelector } from "~/components/home/month-selector";
import { PageHeader } from "~/components/layout/page-header";
import type { Month } from "~/lib/month";

export function HomeHeader({
  user,
  month,
  onMonthChange,
}: {
  user: { name: string; email: string };
  month: Month;
  onMonthChange: (month: Month) => void;
}) {
  return (
    <PageHeader icon={House} title="Home" user={user}>
      <MonthSelector month={month} onChange={onMonthChange} />
    </PageHeader>
  );
}
