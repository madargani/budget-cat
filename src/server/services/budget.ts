import { monthRange, type Month } from "~/lib/month";
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
 * `spent`. `allocated`/`readyToAssign` remain 0 until allocations are modeled.
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

  const sums =
    categoryIds.length > 0
      ? await db.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId,
            categoryId: { in: categoryIds },
            date: { gte: start, lt: end },
          },
          _sum: { amount: true },
        })
      : [];

  const spentByCategory = new Map(
    sums.map((sum) => [sum.categoryId, -(sum._sum.amount ?? 0)]),
  );

  return {
    readyToAssign: 0,
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      categories: group.categories.map((category) => ({
        id: category.id,
        name: category.name,
        allocated: 0,
        spent: spentByCategory.get(category.id) ?? 0,
      })),
    })),
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
