-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "merchantName" TEXT,
    "category" TEXT,
    "isoCurrencyCode" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "transaction_userId_date_idx" ON "transaction"("userId", "date");
