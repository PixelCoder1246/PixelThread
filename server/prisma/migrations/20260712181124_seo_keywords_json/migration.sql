/*
  Warnings:

  - The `keywords` column on the `SeoMeta` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SeoMeta" DROP COLUMN "keywords",
ADD COLUMN     "keywords" JSONB;
