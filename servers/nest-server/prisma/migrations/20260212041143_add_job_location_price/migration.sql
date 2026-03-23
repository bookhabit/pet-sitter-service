-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('hourly', 'daily');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "price_type" "PriceType";
