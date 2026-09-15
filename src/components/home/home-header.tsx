"use client";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { getInitials } from "~/lib/format";
import type { Month } from "~/lib/month";
import { MonthSelector } from "~/components/home/month-selector";

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
    <header className="flex items-center justify-between px-4 py-3">
      <Avatar>
        <AvatarFallback>{getInitials(user.name) || getInitials(user.email)}</AvatarFallback>
      </Avatar>
      <MonthSelector month={month} onChange={onMonthChange} />
    </header>
  );
}