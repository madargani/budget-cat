export type MockTransaction = {
  id: string;
  name: string;
  merchantName: string | null;
  amount: number;
  date: string;
  category: string | null;
  unassigned: boolean;
};

type TransactionTemplate = {
  name: string;
  merchantName: string | null;
  amount: number;
  daysAgo: number;
  category: string;
};

const transactionTemplates: TransactionTemplate[] = [
  {
    name: "INTRST PYMNT",
    merchantName: null,
    amount: 12.7,
    daysAgo: 9,
    category: "Transfer",
  },
  {
    name: "Starbucks",
    merchantName: "Starbucks",
    amount: -4.33,
    daysAgo: 7,
    category: "Food and Drink",
  },
  {
    name: "McDonald's",
    merchantName: "McDonald's",
    amount: -12,
    daysAgo: 5,
    category: "Food and Drink",
  },
  {
    name: "United Airlines",
    merchantName: "United Airlines",
    amount: -284.5,
    daysAgo: 4,
    category: "Travel",
  },
  {
    name: "SparkFun",
    merchantName: "SparkFun",
    amount: -26.99,
    daysAgo: 3,
    category: "Shopping",
  },
  {
    name: "Uber 063015 SF**POOL**",
    merchantName: "Uber",
    amount: -9.24,
    daysAgo: 1,
    category: "Travel",
  },
];

function hashDate(date: string): number {
  let h = 1779033703;
  for (let i = 0; i < date.length; i++) {
    h = Math.imul(h ^ date.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
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

function toDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMockTransactions(): MockTransaction[] {
  const now = new Date();
  const rand = mulberry32(hashDate(toDateString(now)));

  const transactions = transactionTemplates.map((template, index) => {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - template.daysAgo,
      ),
    );

    const drift = Math.round(rand() * 100) / 100;
    const amount =
      template.amount < 0 ? template.amount - drift : template.amount + drift;

    return {
      id: `mock-${index + 1}`,
      name: template.name,
      merchantName: template.merchantName,
      amount,
      date: toDateString(date),
      category: template.category,
      unassigned: index < 5,
    };
  });

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

export function getUnassignedTransactions(): MockTransaction[] {
  return getMockTransactions().filter((transaction) => transaction.unassigned);
}
