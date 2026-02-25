-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'NUMERIC', 'DATE');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "brokerage" TEXT,
    "licenseNumber" TEXT,
    "phoneNumber" TEXT,
    "workspaceName" TEXT DEFAULT 'My Workspace',
    "mlsIntegrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "featureFlags" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientOnboardingLink" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "clientId" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientOnboardingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeTemplate" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeQuestion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "conditionalLogic" JSONB,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fieldMapping" TEXT,
    "helpText" TEXT,

    CONSTRAINT "IntakeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeResponse" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPreferences" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "desiredAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "schoolDistricts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hasPool" BOOLEAN,
    "parkingRequired" INTEGER,
    "petFriendly" BOOLEAN,
    "isInvestment" BOOLEAN NOT NULL DEFAULT false,
    "targetCashFlow" DOUBLE PRECISION,
    "desiredMoveDate" TIMESTAMP(3),
    "flexibilityLevel" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ChecklistTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChecklist" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "templateItemId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "DocumentChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MlsIntegration" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "mlsProvider" TEXT NOT NULL,
    "credentialsEncrypted" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "syncFrequency" TEXT DEFAULT 'DAILY',
    "lastSyncAt" TIMESTAMP(3),
    "syncBuyerListings" BOOLEAN NOT NULL DEFAULT false,
    "syncSellerListings" BOOLEAN NOT NULL DEFAULT false,
    "autoMatchListings" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlsIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_clerkUserId_key" ON "Agent"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_agentId_email_key" ON "Client"("agentId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientOnboardingLink_token_key" ON "ClientOnboardingLink"("token");

-- CreateIndex
CREATE INDEX "ClientOnboardingLink_agentId_token_idx" ON "ClientOnboardingLink"("agentId", "token");

-- CreateIndex
CREATE INDEX "IntakeQuestion_templateId_idx" ON "IntakeQuestion"("templateId");

-- CreateIndex
CREATE INDEX "IntakeResponse_clientId_idx" ON "IntakeResponse"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeResponse_clientId_questionId_key" ON "IntakeResponse"("clientId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientPreferences_clientId_key" ON "ClientPreferences"("clientId");

-- CreateIndex
CREATE INDEX "ChecklistTemplateItem_templateId_idx" ON "ChecklistTemplateItem"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChecklist_clientId_key" ON "DocumentChecklist"("clientId");

-- CreateIndex
CREATE INDEX "DocumentChecklistItem_checklistId_idx" ON "DocumentChecklistItem"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChecklistItem_checklistId_templateItemId_key" ON "DocumentChecklistItem"("checklistId", "templateItemId");

-- CreateIndex
CREATE UNIQUE INDEX "MlsIntegration_agentId_key" ON "MlsIntegration"("agentId");

-- CreateIndex
CREATE INDEX "AuditLog_agentId_resourceType_idx" ON "AuditLog"("agentId", "resourceType");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeTemplate" ADD CONSTRAINT "IntakeTemplate_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeQuestion" ADD CONSTRAINT "IntakeQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "IntakeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeResponse" ADD CONSTRAINT "IntakeResponse_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeResponse" ADD CONSTRAINT "IntakeResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "IntakeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPreferences" ADD CONSTRAINT "ClientPreferences_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistTemplate" ADD CONSTRAINT "ChecklistTemplate_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistTemplateItem" ADD CONSTRAINT "ChecklistTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChecklist" ADD CONSTRAINT "DocumentChecklist_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChecklist" ADD CONSTRAINT "DocumentChecklist_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChecklistItem" ADD CONSTRAINT "DocumentChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "DocumentChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChecklistItem" ADD CONSTRAINT "DocumentChecklistItem_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "ChecklistTemplateItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MlsIntegration" ADD CONSTRAINT "MlsIntegration_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
