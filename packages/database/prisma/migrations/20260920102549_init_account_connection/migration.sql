/*
  Warnings:

  - Added the required column `updatedAt` to the `AccountConnection` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `provider` on the `AccountConnection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `kind` on the `AccountConnection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConnectionProvider" AS ENUM ('anthropic', 'openai', 'google', 'maxintel', 'instaskul', 'dukaboda', 'zuria');

-- CreateEnum
CREATE TYPE "ConnectionKind" AS ENUM ('ai_byok', 'ai_routed', 'product_oauth');

-- AlterTable
ALTER TABLE "AccountConnection" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "ConnectionProvider" NOT NULL,
DROP COLUMN "kind",
ADD COLUMN     "kind" "ConnectionKind" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AccountConnection_userId_provider_key" ON "AccountConnection"("userId", "provider");
