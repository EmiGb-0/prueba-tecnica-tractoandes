-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'READER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'READER';
