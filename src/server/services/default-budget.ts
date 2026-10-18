import { db } from "~/server/db";

import defaultBudget from "./default-budget.json";

/**
 * Gives a user the starter set of category groups and categories. Runs when a
 * user is created (see `~/server/better-auth/config.ts`) and can be re-run
 * safely: every insert is an upsert keyed on the user's group names and each
 * group's category names, so groups and categories the user already has are
 * left alone.
 *
 * A template group always lands on its template position, so backfilling an
 * account that already has groups cannot leave two groups sharing an `order`.
 * Only `order` is rewritten — names, categories and transactions are never
 * touched.
 *
 * The template lives in `default-budget.json` so `prisma/seed.mjs` (which
 * cannot import TypeScript) shares the exact same list.
 */
export async function seedDefaultBudget(userId: string) {
  for (const [groupIndex, group] of defaultBudget.entries()) {
    const created = await db.categoryGroup.upsert({
      where: { userId_name: { userId, name: group.name } },
      update: { order: groupIndex },
      create: { name: group.name, order: groupIndex, userId },
    });

    for (const [categoryIndex, name] of group.categories.entries()) {
      await db.category.upsert({
        where: { groupId_name: { groupId: created.id, name } },
        update: {},
        create: { name, order: categoryIndex, groupId: created.id },
      });
    }
  }
}
