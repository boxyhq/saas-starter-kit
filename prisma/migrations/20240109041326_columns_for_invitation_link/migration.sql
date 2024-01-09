-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sentViaEmail" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "email" DROP NOT NULL;
