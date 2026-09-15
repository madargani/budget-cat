import type { Month } from "~/lib/month";

export type BudgetCategory = {
  id: string;
  name: string;
  allocated: number;
  spent: number;
};

export type CategoryGroup = {
  id: string;
  name: string;
  categories: BudgetCategory[];
};

export type MockBudget = {
  readyToAssign: number;
  groups: CategoryGroup[];
};

type CategoryTemplate = {
  id: string;
  name: string;
  allocated: number;
  spend: "needs" | "wants" | "savings";
};

const groupTemplates: {
  id: string;
  name: string;
  categories: CategoryTemplate[];
}[] = [
  {
    id: "needs",
    name: "Needs",
    categories: [
      { id: "housing", name: "Housing", allocated: 1600, spend: "needs" },
      { id: "groceries", name: "Groceries", allocated: 550, spend: "needs" },
      { id: "health", name: "Health", allocated: 300, spend: "needs" },
      { id: "transport", name: "Transport", allocated: 220, spend: "needs" },
      { id: "utilities", name: "Utilities", allocated: 180, spend: "needs" },
    ],
  },
  {
    id: "wants",
    name: "Wants",
    categories: [
      { id: "dining", name: "Dining", allocated: 250, spend: "wants" },
      { id: "entertainment", name: "Entertainment", allocated: 120, spend: "wants" },
      { id: "shopping", name: "Shopping", allocated: 200, spend: "wants" },
      { id: "subscriptions", name: "Subscriptions", allocated: 60, spend: "wants" },
    ],
  },
  {
    id: "savings",
    name: "Savings",
    categories: [
      { id: "emergency-fund", name: "Emergency Fund", allocated: 500, spend: "savings" },
      { id: "investing", name: "Investing", allocated: 400, spend: "savings" },
      { id: "vacation", name: "Vacation", allocated: 300, spend: "savings" },
    ],
  },
];

function hashMonth(month: Month): number {
  const seed = month.year * 372 + month.month * 31 + 17;
  let h = 1779033703 ^ seed;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value);
}

export function getMockBudget(month: Month): MockBudget {
  const rand = mulberry32(hashMonth(month));

  const groups = groupTemplates.map((group) => ({
    id: group.id,
    name: group.name,
    categories: group.categories.map((category) => {
      const allocated = round(category.allocated * (0.9 + rand() * 0.2));
      let spent: number;

      if (category.spend === "needs") {
        spent = round(allocated * (0.55 + rand() * 0.4));
      } else if (category.spend === "savings") {
        spent = round(allocated * (0.05 + rand() * 0.25));
      } else if (category.id === "dining" && rand() > 0.55) {
        spent = round(allocated * (1.05 + rand() * 0.3));
      } else {
        spent = round(allocated * (0.4 + rand() * 0.55));
      }

      return { id: category.id, name: category.name, allocated, spent };
    }),
  }));

  return {
    readyToAssign: round(300 + rand() * 350),
    groups,
  };
}