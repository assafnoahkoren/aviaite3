-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "baseTokensPerMonth" INTEGER,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserTokenUsage" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "TokenPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tokenAmount" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TokenPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "availableTokens" INTEGER NOT NULL DEFAULT 0,
    "monthlyResetTokens" INTEGER NOT NULL DEFAULT 0,
    "purchasedTokens" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TokenPurchase_userId_idx" ON "TokenPurchase"("userId");

-- CreateIndex
CREATE INDEX "TokenPurchase_productId_idx" ON "TokenPurchase"("productId");

-- CreateIndex
CREATE INDEX "TokenPurchase_expiresAt_idx" ON "TokenPurchase"("expiresAt");

-- CreateIndex
CREATE INDEX "TokenPurchase_deletedAt_idx" ON "TokenPurchase"("deletedAt");

-- CreateIndex
CREATE INDEX "TokenBalance_userId_idx" ON "TokenBalance"("userId");

-- CreateIndex
CREATE INDEX "TokenBalance_productId_idx" ON "TokenBalance"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBalance_userId_productId_key" ON "TokenBalance"("userId", "productId");

-- CreateIndex
CREATE INDEX "Product_isRecurring_idx" ON "Product"("isRecurring");

-- CreateIndex
CREATE INDEX "UserTokenUsage_organizationId_date_idx" ON "UserTokenUsage"("organizationId", "date");

-- CreateIndex
CREATE INDEX "UserTokenUsage_organizationId_productId_date_idx" ON "UserTokenUsage"("organizationId", "productId", "date");

-- AddForeignKey
ALTER TABLE "TokenPurchase" ADD CONSTRAINT "TokenPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPurchase" ADD CONSTRAINT "TokenPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
