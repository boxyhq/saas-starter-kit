-- CreateTable
CREATE TABLE IF NOT EXISTS "jackson_store" (
    "key" VARCHAR(1500) NOT NULL,
    "value" TEXT NOT NULL,
    "iv" VARCHAR(64),
    "tag" VARCHAR(64),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(6),
    "namespace" VARCHAR(64),

    CONSTRAINT "_jackson_store_key" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "jackson_index" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(1500) NOT NULL,
    "storeKey" VARCHAR(1500) NOT NULL,

    CONSTRAINT "_jackson_index_id" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "jackson_ttl" (
    "key" VARCHAR(1500) NOT NULL,
    "expiresAt" BIGINT NOT NULL,

    CONSTRAINT "jackson_ttl_key" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_jackson_store_namespace" ON "jackson_store"("namespace");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_jackson_index_key" ON "jackson_index"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_jackson_index_key_store" ON "jackson_index"("key", "storeKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_jackson_ttl_expires_at" ON "jackson_ttl"("expiresAt");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'jackson_index' 
        AND constraint_name = 'jackson_index_storeKey_fkey'
    ) THEN
        ALTER TABLE "jackson_index"
        ADD CONSTRAINT "jackson_index_storeKey_fkey"
        FOREIGN KEY ("storeKey") REFERENCES "jackson_store"("key")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;