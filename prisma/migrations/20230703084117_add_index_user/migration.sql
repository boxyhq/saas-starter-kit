-- DropIndex
DROP INDEX IF EXISTS "TeamMember_userId_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");