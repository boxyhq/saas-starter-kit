-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invalid_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedAt" TIMESTAMP(3);
