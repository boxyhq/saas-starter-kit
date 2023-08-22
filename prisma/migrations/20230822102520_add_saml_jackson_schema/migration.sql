-- CreateTable
CREATE TABLE "jackson_store" (
    "key" VARCHAR(1500) NOT NULL,
    "value" TEXT NOT NULL,
    "iv" VARCHAR(64),
    "tag" VARCHAR(64),
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0),

    CONSTRAINT "jackson_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "jackson_index" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(1500) NOT NULL,
    "storeKey" VARCHAR(1500) NOT NULL,

    CONSTRAINT "jackson_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jackson_ttl" (
    "key" VARCHAR(1500) NOT NULL,
    "expiresAt" BIGINT NOT NULL,

    CONSTRAINT "jackson_ttl_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "jackson_index_key_idx" ON "jackson_index"("key");

-- CreateIndex
CREATE INDEX "jackson_index_key_storeKey_idx" ON "jackson_index"("key", "storeKey");

-- CreateIndex
CREATE INDEX "jackson_ttl_expiresAt_idx" ON "jackson_ttl"("expiresAt");

-- AddForeignKey
ALTER TABLE "jackson_index" ADD CONSTRAINT "jackson_index_storeKey_fkey" FOREIGN KEY ("storeKey") REFERENCES "jackson_store"("key") ON DELETE CASCADE ON UPDATE CASCADE;
