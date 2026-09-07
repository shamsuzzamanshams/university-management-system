/*
  Warnings:

  - You are about to drop the column `enrolledAt` on the `CourseEnrollment` table. All the data in the column will be lost.
  - Added the required column `semesterNumber` to the `CourseEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CourseEnrollment_courseId_key";

-- DropIndex
DROP INDEX "CourseEnrollment_studentId_key";

-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "enrolledAt",
ADD COLUMN     "semesterNumber" INTEGER NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
