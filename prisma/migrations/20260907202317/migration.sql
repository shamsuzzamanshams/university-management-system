/*
  Warnings:

  - You are about to drop the column `courseId` on the `section` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[semesterId,name]` on the table `section` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "section" DROP CONSTRAINT "section_courseId_fkey";

-- DropIndex
DROP INDEX "section_courseId_semesterId_name_key";

-- AlterTable
ALTER TABLE "section" DROP COLUMN "courseId";

-- CreateIndex
CREATE UNIQUE INDEX "section_semesterId_name_key" ON "section"("semesterId", "name");
