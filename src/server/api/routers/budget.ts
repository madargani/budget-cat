import { TRPCError } from "@trpc/server";

import {
  addCategoryGroupInput,
  addCategoryInput,
} from "~/server/api/schemas/budget";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

export const budgetRouter = createTRPCRouter({
  getHome: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.categoryGroup.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        categories: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return {
      readyToAssign: 0,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        categories: group.categories.map((category) => ({
          id: category.id,
          name: category.name,
          // Allocations and spending aren't modeled yet.
          allocated: 0,
          spent: 0,
        })),
      })),
    };
  }),

  addCategoryGroup: protectedProcedure
    .input(addCategoryGroupInput)
    .mutation(async ({ ctx, input }) => {
      const groupCount = await ctx.db.categoryGroup.count({
        where: { userId: ctx.session.user.id },
      });

      try {
        return await ctx.db.categoryGroup.create({
          data: {
            name: input.name,
            order: groupCount,
            userId: ctx.session.user.id,
          },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category group with this name already exists.",
          });
        }
        throw error;
      }
    }),

  addCategory: protectedProcedure
    .input(addCategoryInput)
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.categoryGroup.findFirst({
        where: { id: input.groupId, userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The selected category group could not be found.",
        });
      }

      const categoryCount = await ctx.db.category.count({
        where: { groupId: group.id },
      });

      try {
        return await ctx.db.category.create({
          data: {
            name: input.name,
            order: categoryCount,
            groupId: group.id,
          },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this name already exists in this group.",
          });
        }
        throw error;
      }
    }),
});
