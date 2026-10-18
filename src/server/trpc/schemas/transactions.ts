import { z } from "zod";

export const getTransactionsInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  itemId: z.string().optional(),
});

export type GetTransactionsInput = z.infer<typeof getTransactionsInput>;

export const getCategoryTransactionsInput = z.object({
  categoryId: z.string().min(1),
  year: z.number().int(),
  month: z.number().int().min(0).max(11),
});

export type GetCategoryTransactionsInput = z.infer<
  typeof getCategoryTransactionsInput
>;

export const assignTransactionCategoryInput = z.object({
  transactionId: z.string().min(1),
  categoryId: z.string().min(1),
});

export type AssignTransactionCategoryInput = z.infer<
  typeof assignTransactionCategoryInput
>;
