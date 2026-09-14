-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLink" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "periodLabel" TEXT,
    "description" TEXT NOT NULL,
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "projects" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experience_startDate_idx" ON "Experience"("startDate");
