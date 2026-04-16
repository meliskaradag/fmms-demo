ALTER TABLE public."WorkOrders"
  ADD COLUMN IF NOT EXISTS "ClosureSummary" text,
  ADD COLUMN IF NOT EXISTS "RootCause" text,
  ADD COLUMN IF NOT EXISTS "ActionsTaken" text,
  ADD COLUMN IF NOT EXISTS "Recommendations" text,
  ADD COLUMN IF NOT EXISTS "LaborHours" numeric,
  ADD COLUMN IF NOT EXISTS "LaborCostPerHour" numeric,
  ADD COLUMN IF NOT EXISTS "MaterialCost" numeric,
  ADD COLUMN IF NOT EXISTS "ExternalServiceCost" numeric,
  ADD COLUMN IF NOT EXISTS "ClosedBy" uuid;

ALTER TABLE public."WorkOrderAssignees"
  ADD COLUMN IF NOT EXISTS "AcceptanceStatus" text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "RespondedAt" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "RejectionReason" text,
  ADD COLUMN IF NOT EXISTS "EstimatedMinutes" integer;

CREATE TABLE IF NOT EXISTS public."WorkOrderStepCompletions" (
  "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "TenantId" uuid NOT NULL,
  "WorkOrderId" uuid NOT NULL,
  "MaintenanceCardStepId" uuid NOT NULL,
  "StepOrder" integer NOT NULL DEFAULT 0,
  "Instruction" text NOT NULL DEFAULT '',
  "EstimatedMinutes" integer NOT NULL DEFAULT 0,
  "StepStatus" integer NOT NULL DEFAULT 0,
  "IsCompleted" boolean NOT NULL DEFAULT false,
  "CompletedAt" timestamp with time zone,
  "CompletedBy" uuid,
  "Notes" text,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "CreatedBy" uuid,
  "UpdatedAt" timestamp with time zone,
  "UpdatedBy" uuid,
  "ChangeIp" text NOT NULL DEFAULT '127.0.0.1',
  "IsDeleted" boolean NOT NULL DEFAULT false,
  "DeletedAt" timestamp with time zone,
  "DeletedBy" uuid,
  CONSTRAINT "PK_WorkOrderStepCompletions_public" PRIMARY KEY ("Id"),
  CONSTRAINT "FK_WorkOrderStepCompletions_WorkOrders_public" FOREIGN KEY ("WorkOrderId")
    REFERENCES public."WorkOrders"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_WorkOrderStepCompletions_WorkOrderId_public"
  ON public."WorkOrderStepCompletions" ("WorkOrderId");
