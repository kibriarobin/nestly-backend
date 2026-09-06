/*
  Warnings:

  - You are about to alter the column `rent` on the `applications` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `rent` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `rent` on the `flats` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `rent` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "rent" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "rent" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "flats" ALTER COLUMN "rent" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "rent" SET DATA TYPE DECIMAL(10,2);
