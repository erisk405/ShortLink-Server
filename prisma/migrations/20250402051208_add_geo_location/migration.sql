-- CreateTable
CREATE TABLE "GeoLocation" (
    "id" SERIAL NOT NULL,
    "clickId" INTEGER NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "GeoLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeoLocation_clickId_key" ON "GeoLocation"("clickId");

-- AddForeignKey
ALTER TABLE "GeoLocation" ADD CONSTRAINT "GeoLocation_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "clicks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
