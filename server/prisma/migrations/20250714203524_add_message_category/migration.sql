-- CreateEnum
CREATE TYPE "MessageCategory" AS ENUM ('WARNINGS_ALERTS', 'LIMITATIONS', 'OTHER', 'SYSTEM_OPERATIONS', 'FLIGHT_CONTROLS', 'AUTOPILOT_FMC', 'PROCEDURES');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "category" "MessageCategory";

-- CreateIndex
CREATE INDEX "Message_category_idx" ON "Message"("category");
