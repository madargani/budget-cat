import { TRPCError } from "@trpc/server";

import {
  addCategoryGroupInput,
  addCategoryInput,
  getHomeInput,
} from "~/server/api/schemas/budget";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  addCategory,
  addCategoryGroup,
  getHome,
} from "~/server/services/budget";

export const budgetRouter = createTRPCRouter({
  getHome: protectedProcedure
    .input(getHomeInput)
    .query(({ ctx, input }) => getHome(ctx.session.user.id, input)),

  addCategoryGroup: protectedProcedure
    .input(addCategoryGroupInput)
    .mutation(async ({ ctx, input }) => {
      const result = await addCategoryGroup({
        userId: ctx.session.user.id,
        name: input.name,
      });

      if (!result.ok) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category group with this name already exists.",
        });
      }

      return result.group;
    }),

  addCategory: protectedProcedure
    .input(addCategoryInput)
    .mutation(async ({ ctx, input }) => {
      const result = await addCategory({
        userId: ctx.session.user.id,
        groupId: input.groupId,
        name: input.name,
      });

      if (!result.ok) {
        throw new TRPCError({
          code: result.reason === "duplicate" ? "CONFLICT" : "NOT_FOUND",
          message:
            result.reason === "duplicate"
              ? "A category with this name already exists in this group."
              : "The selected category group could not be found.",
        });
      }

      return result.category;
    }),
});
