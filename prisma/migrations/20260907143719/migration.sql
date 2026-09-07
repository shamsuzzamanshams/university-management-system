/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `CourseEnrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `CourseEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "courseId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_key" ON "CourseEnrollment"("courseId");

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
