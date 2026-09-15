import type { Month } from "~/lib/month";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const transactionCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTransactionAmount(amount: number): string {
  return transactionCurrencyFormatter.format(amount);
}

const transactionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTransactionDate(date: string | Date): string {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
  return transactionDateFormatter.format(value);
}

const monthLongFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonth(month: Month): string {
  return monthLongFormatter.format(
    new Date(Date.UTC(month.year, month.month, 1)),
  );
}

const monthShortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

export function formatMonthShort(month: Month): string {
  return monthShortFormatter.format(
    new Date(Date.UTC(month.year, month.month, 1)),
  );
}

export function getInitials(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
