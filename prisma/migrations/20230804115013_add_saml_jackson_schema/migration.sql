-- CreateTable
CREATE TABLE "jackson_store" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jackson_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "jackson_index" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "storeKey" TEXT NOT NULL,

    CONSTRAINT "jackson_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jackson_ttl" (
    "key" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jackson_ttl_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "jackson_index_key_idx" ON "jackson_index"("key");

-- AddForeignKey
ALTER TABLE "jackson_index" ADD CONSTRAINT "jackson_index_storeKey_fkey" FOREIGN KEY ("storeKey") REFERENCES "jackson_store"("key") ON DELETE CASCADE ON UPDATE CASCADE;
