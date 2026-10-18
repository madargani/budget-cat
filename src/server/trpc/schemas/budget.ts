import { z } from "zod";

export const getHomeInput = z.object({
  year: z.number().int(),
  month: z.number().int().min(0).max(11),
});

export const addCategoryGroupInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const addCategoryInput = z.object({
  groupId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(50),
});

// Identifies one category in one month. Shared by the allocation mutations
// and the "what did last month leave over" read.
export const categoryMonthInput = z.object({
  categoryId: z.string().min(1),
  year: z.number().int(),
  month: z.number().int().min(0).max(11),
});

// Only the editable field, so the allocation form and the API validate the
// amount with the exact same rules.
export const allocationAmountInput = z.object({
  amount: z
    .number({ invalid_type_error: "Enter an amount" })
    .finite("Enter an amount")
    .min(0, "Amount cannot be negative"),
});

export const setAllocationInput =
  allocationAmountInput.merge(categoryMonthInput);

// Shape rendered on the home screen. `allocated` comes from the month's
// Allocation rows; `spent` is derived from the month's transactions.
export const budgetCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  allocated: z.number(),
  spent: z.number(),
});

export const categoryGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  categories: z.array(budgetCategorySchema),
});

export type GetHomeInput = z.infer<typeof getHomeInput>;
export type AddCategoryGroupInput = z.infer<typeof addCategoryGroupInput>;
export type AddCategoryInput = z.infer<typeof addCategoryInput>;
export type AllocationAmountInput = z.infer<typeof allocationAmountInput>;
export type SetAllocationInput = z.infer<typeof setAllocationInput>;
export type CategoryMonthInput = z.infer<typeof categoryMonthInput>;
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;
export type CategoryGroup = z.infer<typeof categoryGroupSchema>;
