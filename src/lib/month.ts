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

/**
 * Half-open UTC range `[start, end)` covering the month. Transactions are
 * stored from Plaid `YYYY-MM-DD` dates at UTC midnight, so filtering on this
 * range selects exactly the transactions dated within the month.
 */
export function monthRange(month: Month): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(month.year, month.month, 1)),
    end: new Date(Date.UTC(month.year, month.month + 1, 1)),
  };
}

export function shiftMonth(month: Month, delta: number): Month {
  const date = new Date(Date.UTC(month.year, month.month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}