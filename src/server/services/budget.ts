import { monthRange, shiftMonth, type Month } from "~/lib/month";
import { db } from "~/server/db";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

/**
 * Returns the home-screen budget overview for a single month. `spent` is the
 * sum of the month's assigned transactions per category (amounts are stored
 * with spending negative, so a category's spend is the negated sum). A
 * positive amount assigned to a category — a refund or inflow — reduces its
 * `spent`. `allocated` is the sum of the month's Allocation rows, which are 0
 * for any category the user has not budgeted yet.
 *
 * `readyToAssign` stays 0 until account balances are synced, so there is
 * nothing to derive "money available to budget" from yet.
 */
export async function getHome(userId: string, month: Month) {
  const groups = await db.categoryGroup.findMany({
    where: { userId },
    include: {
      categories: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const categoryIds = groups.flatMap((group) =>
    group.categories.map((category) => category.id),
  );
  const { start, end } = monthRange(month);

  const [sums, allocations] =
    categoryIds.length > 0
      ? await Promise.all([
          db.transaction.groupBy({
            by: ["categoryId"],
            where: {
              userId,
              categoryId: { in: categoryIds },
              date: { gte: start, lt: end },
            },
            _sum: { amount: true },
          }),
          db.allocation.groupBy({
            by: ["categoryId"],
            where: {
              userId,
              categoryId: { in: categoryIds },
              year: month.year,
              month: month.month,
            },
            _sum: { amount: true },
          }),
        ])
      : [[], []];

  const spentByCategory = new Map(
    sums.map((sum) => [sum.categoryId, -(sum._sum.amount ?? 0)]),
  );
  const allocatedByCategory = new Map(
    allocations.map((row) => [row.categoryId, row._sum.amount ?? 0]),
  );

  return {
    readyToAssign: 0,
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      categories: group.categories.map((category) => ({
        id: category.id,
        name: category.name,
        allocated: allocatedByCategory.get(category.id) ?? 0,
        spent: spentByCategory.get(category.id) ?? 0,
      })),
    })),
  };
}

/**
 * Sets how much a category is budgeted for a single month, replacing any
 * previous amount. Returns `{ ok: false, reason: "category-not-found" }` when
 * the category doesn't belong to the user, so the router can surface a
 * NOT_FOUND without this service depending on tRPC.
 */
export async function setAllocation({
  userId,
  categoryId,
  month,
  amount,
}: {
  userId: string;
  categoryId: string;
  month: Month;
  amount: number;
}) {
  const category = await db.category.findFirst({
    where: { id: categoryId, group: { userId } },
    select: { id: true },
  });

  if (!category) {
    return { ok: false as const, reason: "category-not-found" as const };
  }

  const allocation = await db.allocation.upsert({
    where: {
      categoryId_year_month: {
        categoryId: category.id,
        year: month.year,
        month: month.month,
      },
    },
    create: {
      amount,
      year: month.year,
      month: month.month,
      userId,
      categoryId: category.id,
    },
    update: { amount },
  });

  return { ok: true as const, allocation };
}

/**
 * Reports what the previous month left over for a category, so the UI can
 * offer to carry it forward. `available` is false until the user has actually
 * budgeted the prior month — a category that was never allocated has nothing
 * to copy, even if it has spending.
 */
export async function getPreviousMonthAllocation({
  userId,
  categoryId,
  month,
}: {
  userId: string;
  categoryId: string;
  month: Month;
}) {
  const previous = shiftMonth(month, -1);
  const { start, end } = monthRange(previous);

  const [allocation, spent] = await Promise.all([
    db.allocation.findFirst({
      where: {
        categoryId,
        userId,
        year: previous.year,
        month: previous.month,
      },
      select: { amount: true },
    }),
    db.transaction.aggregate({
      where: { userId, categoryId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  if (!allocation) {
    return { available: false, remaining: 0, month: previous };
  }

  // Amounts are stored negative for spend, so negating the sum gives a
  // positive figure for money spent.
  const spentAmount = -(spent._sum.amount ?? 0);

  return {
    available: true,
    remaining: allocation.amount - spentAmount,
    month: previous,
  };
}

/**
 * Carries a category's previous-month leftover into `month` as its new
 * allocation, so a new budget period starts from where the last one ended
 * rather than at zero. Returns `{ ok: false, reason: ... }` when the category
 * isn't the user's or the prior month was never budgeted, so the router can
 * map both to NOT_FOUND and the UI can explain why nothing happened.
 */
export async function copyAllocationFromPreviousMonth({
  userId,
  categoryId,
  month,
}: {
  userId: string;
  categoryId: string;
  month: Month;
}) {
  const previous = await getPreviousMonthAllocation({
    userId,
    categoryId,
    month,
  });

  if (!previous.available) {
    return { ok: false as const, reason: "no-previous-allocation" as const };
  }

  const result = await setAllocation({
    userId,
    categoryId,
    month,
    amount: previous.remaining,
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    allocation: result.allocation,
    remaining: previous.remaining,
  };
}

/**
 * Creates a category group at the end of the user's list. Returns
 * `{ ok: false, reason: "duplicate" }` when the name is already taken, so the
 * router can surface a CONFLICT without this service depending on tRPC.
 */
export async function addCategoryGroup({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const groupCount = await db.categoryGroup.count({ where: { userId } });

  try {
    const group = await db.categoryGroup.create({
      data: { name, order: groupCount, userId },
    });

    return { ok: true as const, group };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}

/**
 * Creates a category inside one of the user's groups. Returns
 * `{ ok: false, reason: "group-not-found" }` when the group does not belong to
 * the user and `{ ok: false, reason: "duplicate" }` when the name is taken
 * within that group.
 */
export async function addCategory({
  userId,
  groupId,
  name,
}: {
  userId: string;
  groupId: string;
  name: string;
}) {
  const group = await db.categoryGroup.findFirst({
    where: { id: groupId, userId },
    select: { id: true },
  });

  if (!group) {
    return { ok: false as const, reason: "group-not-found" as const };
  }

  const categoryCount = await db.category.count({
    where: { groupId: group.id },
  });

  try {
    const category = await db.category.create({
      data: { name, order: categoryCount, groupId: group.id },
    });

    return { ok: true as const, category };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}
