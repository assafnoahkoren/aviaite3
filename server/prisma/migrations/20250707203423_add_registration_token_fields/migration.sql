-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "label" TEXT,
ADD COLUMN     "usedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "VerificationToken_usedByUserId_idx" ON "VerificationToken"("usedByUserId");

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
