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

// Shape rendered on the home screen. `allocated` is still a placeholder (no
// allocation model yet); `spent` is derived from the month's transactions.
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
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;
export type CategoryGroup = z.infer<typeof categoryGroupSchema>;
