/*
  Warnings:

  - A unique constraint covering the columns `[merchantInvoiceNumber]` on the table `studentFee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bkashPaymentId]` on the table `studentFee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `merchantInvoiceNumber` to the `studentFee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "studentFee" ADD COLUMN     "bkashPaymentId" TEXT,
ADD COLUMN     "bkashTrxId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "merchantInvoiceNumber" TEXT NOT NULL,
ADD COLUMN     "payerReference" TEXT,
ADD COLUMN     "paymentGetway" TEXT NOT NULL DEFAULT 'bkash';

-- CreateIndex
CREATE UNIQUE INDEX "studentFee_merchantInvoiceNumber_key" ON "studentFee"("merchantInvoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "studentFee_bkashPaymentId_key" ON "studentFee"("bkashPaymentId");
