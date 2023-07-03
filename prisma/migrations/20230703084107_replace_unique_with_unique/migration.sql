-- DropIndex
DROP INDEX "TeamMember_userId_key";

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");
