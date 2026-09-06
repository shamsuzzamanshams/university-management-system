-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_programId_fkey";

-- AlterTable
ALTER TABLE "student" ALTER COLUMN "departmentId" DROP NOT NULL,
ALTER COLUMN "programId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
