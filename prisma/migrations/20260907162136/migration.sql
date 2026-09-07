/*
  Warnings:

  - Added the required column `academicYear` to the `CourseEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "academicYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "profilePhoto" TEXT;
