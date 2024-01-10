-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "StripeSubscription" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cancelAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeProduct" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "image" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "unitLabel" TEXT,
    "created" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripePrice" (
    "id" TEXT NOT NULL,
    "billingScheme" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "customUnitAmount" TEXT,
    "livemode" BOOLEAN NOT NULL,
    "lookupKey" TEXT,
    "metadata" JSONB NOT NULL,
    "nickname" TEXT,
    "productId" TEXT NOT NULL,
    "recurring" JSONB NOT NULL,
    "tiersMode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unitAmount" TEXT,
    "unitAmountDecimal" TEXT,

    CONSTRAINT "StripePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeSubscription_subscriptionId_key" ON "StripeSubscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "StripePrice" ADD CONSTRAINT "StripePrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "StripeProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
