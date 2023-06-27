/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "TeamMember"("userId");
