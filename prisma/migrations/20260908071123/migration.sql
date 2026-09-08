/*
  Warnings:

  - You are about to drop the column `employeeId` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `instructor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "instructor" DROP CONSTRAINT "instructor_userId_fkey";

-- DropIndex
DROP INDEX "instructor_employeeId_key";

-- DropIndex
DROP INDEX "instructor_userId_key";

-- AlterTable
ALTER TABLE "instructor" DROP COLUMN "employeeId",
DROP COLUMN "userId";
