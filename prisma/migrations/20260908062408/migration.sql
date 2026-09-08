/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `instructor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "instructor" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "instructor_email_key" ON "instructor"("email");
