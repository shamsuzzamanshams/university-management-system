-- CreateEnum
CREATE TYPE "InstructorVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "section" DROP CONSTRAINT "section_instructorId_fkey";

-- AlterTable
ALTER TABLE "instructor" ADD COLUMN     "verificationStatus" "InstructorVerificationStatus" NOT NULL DEFAULT 'PENDING';
