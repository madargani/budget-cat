import { z } from "zod";

export const addCategoryGroupInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const addCategoryInput = z.object({
  groupId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(50),
});

export type AddCategoryGroupInput = z.infer<typeof addCategoryGroupInput>;
export type AddCategoryInput = z.infer<typeof addCategoryInput>;
