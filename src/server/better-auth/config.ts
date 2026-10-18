import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "~/server/db";
import { seedDefaultBudget } from "~/server/services/default-budget";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite", // or "sqlite" or "mysql"
  }),
  databaseHooks: {
    // Every new account starts with the starter category groups/categories.
    user: {
      create: {
        after: async (user) => {
          try {
            await seedDefaultBudget(user.id);
          } catch (error) {
            // Never block signup on a seeding hiccup — `npm run db:seed`
            // backfills any user that ended up without the defaults.
            console.error("Failed to seed default budget", error);
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
