import { z } from "zod";

export const exchangePublicTokenInput = z.object({
  public_token: z.string(),
});

export type ExchangePublicTokenInput = z.infer<
  typeof exchangePublicTokenInput
>;