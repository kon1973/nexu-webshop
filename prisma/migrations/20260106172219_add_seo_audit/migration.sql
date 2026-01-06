-- CreateTable
CREATE TABLE "SeoAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "totalProducts" INTEGER NOT NULL,
    "avgScore" INTEGER NOT NULL,
    "criticalCount" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "SeoAudit_pkey" PRIMARY KEY ("id")
);
