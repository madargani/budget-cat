-- CreateTable
CREATE TABLE "category_group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "category_group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "category_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "category_group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "merchantName" TEXT,
    "plaidCategory" TEXT,
    "isoCurrencyCode" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "itemId" TEXT,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "transaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_transaction" ("accountId", "amount", "date", "id", "isoCurrencyCode", "itemId", "merchantName", "name", "pending", "userId", "plaidCategory") SELECT "accountId", "amount", "date", "id", "isoCurrencyCode", "itemId", "merchantName", "name", "pending", "userId", "category" FROM "transaction";
DROP TABLE "transaction";
ALTER TABLE "new_transaction" RENAME TO "transaction";
CREATE INDEX "transaction_userId_date_idx" ON "transaction"("userId", "date");
CREATE INDEX "transaction_categoryId_idx" ON "transaction"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "category_group_userId_order_idx" ON "category_group"("userId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "category_group_userId_name_key" ON "category_group"("userId", "name");

-- CreateIndex
CREATE INDEX "category_groupId_order_idx" ON "category"("groupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "category_groupId_name_key" ON "category"("groupId", "name");