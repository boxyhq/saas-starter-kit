-- AlterTable

DO $$
BEGIN 
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'jackson_index'
        AND constraint_name = 'FK_937b040fb2592b4671cbde09e83'
    ) THEN
        ALTER TABLE "jackson_index"
        RENAME CONSTRAINT "jackson_index_storeKey_fkey" 
        TO "FK_937b040fb2592b4671cbde09e83";
    END IF;
END $$;

-- AlterTable

DO $$
BEGIN 
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'jackson_index'
        AND constraint_name = 'jackson_index_storeKey_fkey'
    ) THEN
        ALTER TABLE "jackson_index"
        DROP CONSTRAINT "jackson_index_storeKey_fkey";
    END IF;
END $$;