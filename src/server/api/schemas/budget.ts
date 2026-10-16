import { z } from "zod";

export const addCategoryGroupInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const addCategoryInput = z.object({
  groupId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(50),
});

// Shape rendered on the home screen. `allocated`/`spent` are placeholders until
// those fields are modeled in Prisma (see `budget.getHome`).
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

export type AddCategoryGroupInput = z.infer<typeof addCategoryGroupInput>;
export type AddCategoryInput = z.infer<typeof addCategoryInput>;
export type BudgetCategory = z.infer<typeof budgetCategorySchema>;
export type CategoryGroup = z.infer<typeof categoryGroupSchema>;
