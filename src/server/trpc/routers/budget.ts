import { TRPCError } from "@trpc/server";

import {
  addCategoryGroupInput,
  addCategoryInput,
  categoryMonthInput,
  getHomeInput,
  setAllocationInput,
} from "~/server/trpc/schemas/budget";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/core";
import {
  addCategory,
  addCategoryGroup,
  copyAllocationFromPreviousMonth,
  getHome,
  getPreviousMonthAllocation,
  setAllocation,
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

  // What last month left over for this category, so the detail sheet can offer
  // to carry it forward. Returns `available: false` rather than erroring when
  // the prior month was never budgeted — that's a normal state, not a failure.
  getPreviousAllocation: protectedProcedure
    .input(categoryMonthInput)
    .query(({ ctx, input }) =>
      getPreviousMonthAllocation({
        userId: ctx.session.user.id,
        categoryId: input.categoryId,
        month: { year: input.year, month: input.month },
      }),
    ),

  setAllocation: protectedProcedure
    .input(setAllocationInput)
    .mutation(async ({ ctx, input }) => {
      const result = await setAllocation({
        userId: ctx.session.user.id,
        categoryId: input.categoryId,
        month: { year: input.year, month: input.month },
        amount: input.amount,
      });

      if (!result.ok) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That category could not be found.",
        });
      }

      return result.allocation;
    }),

  copyAllocation: protectedProcedure
    .input(categoryMonthInput)
    .mutation(async ({ ctx, input }) => {
      const result = await copyAllocationFromPreviousMonth({
        userId: ctx.session.user.id,
        categoryId: input.categoryId,
        month: { year: input.year, month: input.month },
      });

      if (!result.ok) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            result.reason === "no-previous-allocation"
              ? "There is no budget to carry over from last month."
              : "That category could not be found.",
        });
      }

      return { remaining: result.remaining };
    }),
});
