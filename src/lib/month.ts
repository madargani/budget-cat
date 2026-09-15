export type Month = {
  year: number;
  month: number;
};

export function currentMonth(): Month {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function monthKey(month: Month): string {
  return `${month.year}-${String(month.month + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: Month, delta: number): Month {
  const date = new Date(Date.UTC(month.year, month.month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}