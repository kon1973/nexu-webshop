/*
  Warnings:

  - A unique constraint covering the columns `[productId,slug]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_slug_key" ON "ProductVariant"("productId", "slug");
