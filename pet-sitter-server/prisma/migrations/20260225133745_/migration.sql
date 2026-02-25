/*
  Warnings:

  - You are about to drop the column `auth_header` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refresh_token_hash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "auth_header",
ADD COLUMN     "refresh_token_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_user_id_key" ON "Session"("user_id");
