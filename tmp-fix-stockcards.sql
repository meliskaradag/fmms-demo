ALTER TABLE public."StockCards" ADD COLUMN IF NOT EXISTS "ParentId" uuid;
ALTER TABLE public."StockCards" ADD COLUMN IF NOT EXISTS "HierarchyLevel" integer NOT NULL DEFAULT 0;
ALTER TABLE public."StockCards" ADD COLUMN IF NOT EXISTS "HierarchyPath" text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS "IX_StockCards_ParentId" ON public."StockCards" ("ParentId");
