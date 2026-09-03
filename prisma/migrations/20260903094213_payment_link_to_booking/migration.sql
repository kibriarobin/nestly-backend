/*
  Warnings:

  - You are about to drop the column `applicationId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_applicationId_fkey";

-- DropIndex
DROP INDEX "payments_applicationId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "applicationId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
