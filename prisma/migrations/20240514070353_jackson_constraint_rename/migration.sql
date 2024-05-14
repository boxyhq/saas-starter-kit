-- AlterTable

DO $$
BEGIN 
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'jackson_index'
        AND constraint_name = 'FK_937b040fb2592b4671cbde09e83'
    ) THEN
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE table_name = 'jackson_index' 
            AND constraint_name = 'jackson_index_storeKey_fkey'
        ) THEN
            ALTER TABLE "jackson_index"
            DROP CONSTRAINT "jackson_index_storeKey_fkey";
        END IF;
    ELSE
        ALTER TABLE "jackson_index"
        ADD CONSTRAINT "FK_937b040fb2592b4671cbde09e83"
        FOREIGN KEY ("storeKey") REFERENCES "jackson_store"("key")
        ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;