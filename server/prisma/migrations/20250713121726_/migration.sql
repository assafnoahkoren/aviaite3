/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,productId]` on the table `TokenBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TokenBalance" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TokenPurchase" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserTokenUsage" ADD COLUMN     "subscriptionId" TEXT;

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "TokenBalance_organizationId_idx" ON "TokenBalance"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBalance_organizationId_productId_key" ON "TokenBalance"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "TokenPurchase_organizationId_idx" ON "TokenPurchase"("organizationId");

-- CreateIndex
CREATE INDEX "UserTokenUsage_subscriptionId_idx" ON "UserTokenUsage"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTokenUsage" ADD CONSTRAINT "UserTokenUsage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPurchase" ADD CONSTRAINT "TokenPurchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
