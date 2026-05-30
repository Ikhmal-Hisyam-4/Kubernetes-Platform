-- CreateTable
CREATE TABLE "gpu_tiers" (
    "id" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "hardware" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "gpuCount" INTEGER NOT NULL,
    "vram" INTEGER NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "storage" INTEGER NOT NULL,
    "bandwidth" INTEGER NOT NULL,
    "useCase" TEXT NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "available" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gpu_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gpuTierId" TEXT NOT NULL,
    "os" TEXT NOT NULL DEFAULT 'Ubuntu 24.04 LTS',
    "status" TEXT NOT NULL DEFAULT 'Running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "instances" ADD CONSTRAINT "instances_gpuTierId_fkey" FOREIGN KEY ("gpuTierId") REFERENCES "gpu_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
