/*
  Warnings:

  - You are about to drop the column `sectionId` on the `CourseEnrollment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `CourseEnrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CourseEnrollment_studentId_sectionId_key";

-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "sectionId";

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_studentId_key" ON "CourseEnrollment"("studentId");
