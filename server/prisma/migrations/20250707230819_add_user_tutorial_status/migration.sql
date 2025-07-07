-- CreateTable
CREATE TABLE "UserTutorialStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTutorialStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTutorialStatus_userId_idx" ON "UserTutorialStatus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTutorialStatus_userId_tutorialId_key" ON "UserTutorialStatus"("userId", "tutorialId");

-- AddForeignKey
ALTER TABLE "UserTutorialStatus" ADD CONSTRAINT "UserTutorialStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
