-- Normalize stored transaction amounts to the app's sign convention.
--
-- Plaid reports outflows as positive amounts, but this app treats negative as
-- spend. New rows are negated at sync time (see
-- src/server/services/transactions.ts), so this flips the amounts of rows
-- written before that change to match.
UPDATE "transaction" SET "amount" = -"amount";
