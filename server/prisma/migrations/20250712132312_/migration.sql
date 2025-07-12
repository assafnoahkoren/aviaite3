/*
  Warnings:

  - Added the required column `tokenType` to the `UserTokenUsage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('input', 'output');

-- AlterTable
ALTER TABLE "UserTokenUsage" ADD COLUMN     "tokenType" "TokenType" NOT NULL;

-- CreateIndex
CREATE INDEX "UserTokenUsage_tokenType_idx" ON "UserTokenUsage"("tokenType");
