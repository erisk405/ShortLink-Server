/*
  Warnings:

  - You are about to drop the column `clicks` on the `short_urls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "short_urls" DROP COLUMN "clicks";

-- CreateTable
CREATE TABLE "clicks" (
    "id" SERIAL NOT NULL,
    "short_url_id" INTEGER NOT NULL,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_short_url_id_fkey" FOREIGN KEY ("short_url_id") REFERENCES "short_urls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
