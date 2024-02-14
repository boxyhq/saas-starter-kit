-- CreateIndex
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_teamId_idx" ON "Invitation"("teamId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
