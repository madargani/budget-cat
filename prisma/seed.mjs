// Seeds a starter set of category groups and categories for every user in the
// database. Idempotent: re-running it will not create duplicates.
//
// Run with: npm run db:seed
import process from "node:process";

import { PrismaClient } from "../generated/prisma/client.js";

// Shared with the app: the same list is seeded on user creation by
// `src/server/services/default-budget.ts`, which imports this file.
import groupTemplates from "../src/server/services/default-budget.json" with { type: "json" };

process.loadEnvFile(".env");

const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({ select: { id: true } });

  if (users.length === 0) {
    console.log("No users found; nothing to seed.");
    return;
  }

  console.log(`Seeding budget for ${users.length} user(s)...`);

  for (const user of users) {
    for (const [groupIndex, group] of groupTemplates.entries()) {
      const categoryGroup = await db.categoryGroup.upsert({
        where: { userId_name: { userId: user.id, name: group.name } },
        update: { order: groupIndex },
        create: { name: group.name, order: groupIndex, userId: user.id },
      });

      for (const [categoryIndex, name] of group.categories.entries()) {
        await db.category.upsert({
          where: {
            groupId_name: { groupId: categoryGroup.id, name },
          },
          update: {},
          create: { name, order: categoryIndex, groupId: categoryGroup.id },
        });
      }
    }
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
