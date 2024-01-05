-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "allowedDomain" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL;
