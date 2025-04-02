-- CreateTable
CREATE TABLE "short_urls" (
    "id" SERIAL NOT NULL,
    "original_url" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "short_urls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_urls_shortCode_key" ON "short_urls"("shortCode");
