ALTER TABLE public."WorkOrders"
  ADD COLUMN IF NOT EXISTS "ParentWorkOrderId" uuid,
  ADD COLUMN IF NOT EXISTS "BlocksWorkOrderId" uuid;

CREATE TABLE IF NOT EXISTS public."WorkOrderMaterialRequests" (
  "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "TenantId" uuid NOT NULL,
  "WorkOrderId" uuid NOT NULL,
  "StockCardId" uuid NOT NULL,
  "RequestedQuantity" numeric NOT NULL DEFAULT 0,
  "ReservedQuantity" numeric,
  "Unit" text NOT NULL DEFAULT 'adet',
  "Status" integer NOT NULL DEFAULT 0,
  "Note" text,
  "DeliveredAt" timestamp with time zone,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "CreatedBy" uuid,
  "UpdatedAt" timestamp with time zone,
  "UpdatedBy" uuid,
  "ChangeIp" text NOT NULL DEFAULT '127.0.0.1',
  "IsDeleted" boolean NOT NULL DEFAULT false,
  "DeletedAt" timestamp with time zone,
  "DeletedBy" uuid,
  CONSTRAINT "PK_WorkOrderMaterialRequests_public" PRIMARY KEY ("Id"),
  CONSTRAINT "FK_WorkOrderMaterialRequests_WorkOrders_public" FOREIGN KEY ("WorkOrderId") REFERENCES public."WorkOrders"("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_WorkOrderMaterialRequests_WorkOrderId_public"
  ON public."WorkOrderMaterialRequests" ("WorkOrderId");

CREATE TABLE IF NOT EXISTS public."WorkOrderAssignmentRules" (
  "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "TenantId" uuid NOT NULL,
  "Name" text NOT NULL,
  "LocationId" uuid,
  "Priority" integer,
  "Type" integer,
  "AssignToUserId" uuid NOT NULL,
  "AssignRole" text NOT NULL DEFAULT 'technician',
  "AutoSetAssignedStatus" boolean NOT NULL DEFAULT true,
  "IsActive" boolean NOT NULL DEFAULT true,
  "SortOrder" integer NOT NULL DEFAULT 0,
  "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
  "CreatedBy" uuid,
  "UpdatedAt" timestamp with time zone,
  "UpdatedBy" uuid,
  "ChangeIp" text NOT NULL DEFAULT '127.0.0.1',
  "IsDeleted" boolean NOT NULL DEFAULT false,
  "DeletedAt" timestamp with time zone,
  "DeletedBy" uuid,
  CONSTRAINT "PK_WorkOrderAssignmentRules_public" PRIMARY KEY ("Id")
);
