import { z } from "zod";

export const getTransactionsInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  itemId: z.string().optional(),
});

export type GetTransactionsInput = z.infer<typeof getTransactionsInput>;