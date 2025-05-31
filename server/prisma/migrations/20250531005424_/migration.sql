/*
  Warnings:

  - Added the required column `assistantId` to the `Thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "assistantId" TEXT NOT NULL,
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
