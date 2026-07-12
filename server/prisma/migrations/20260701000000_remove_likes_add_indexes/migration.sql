/*
  Warnings:

  - You are about to drop the column `likes` on the `PostAnalytics` table.
  - Added the required column `postId` index on `Comment` and `Like` tables for better query performance.

*/
-- AlterTable
ALTER TABLE "PostAnalytics" DROP COLUMN "likes";

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_commentId_idx" ON "Like"("commentId");
