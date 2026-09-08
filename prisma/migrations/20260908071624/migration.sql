/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `instructor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "instructor" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "instructor_userId_key" ON "instructor"("userId");

-- AddForeignKey
ALTER TABLE "instructor" ADD CONSTRAINT "instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
