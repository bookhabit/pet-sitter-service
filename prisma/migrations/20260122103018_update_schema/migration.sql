/*
  Warnings:

  - The values [COMPLETE,PENDING,CANCELLED] on the enum `ApproveStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [OWNER,SITTER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dog_id` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Dog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('Cat', 'Dog');

-- AlterEnum
BEGIN;
CREATE TYPE "ApproveStatus_new" AS ENUM ('applying', 'approved', 'rejected');
ALTER TABLE "JobApplication" ALTER COLUMN "status" TYPE "ApproveStatus_new" USING ("status"::text::"ApproveStatus_new");
ALTER TYPE "ApproveStatus" RENAME TO "ApproveStatus_old";
ALTER TYPE "ApproveStatus_new" RENAME TO "ApproveStatus";
DROP TYPE "ApproveStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PetOwner', 'PetSitter', 'Admin');
ALTER TABLE "User" ALTER COLUMN "roles" TYPE "Role_new"[] USING ("roles"::text::"Role_new"[]);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_dog_id_fkey";

-- DropIndex
DROP INDEX "Job_dog_id_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "dog_id";

-- DropTable
DROP TABLE "Dog";

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "breed" TEXT NOT NULL,
    "size" TEXT,
    "job_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
