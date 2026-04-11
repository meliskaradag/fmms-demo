using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFaultReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                schema: "public",
                table: "StockMovements",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            // Some environments may already have this column from a partially applied rollout.
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""LocationId"" uuid;");

            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""PerformedAt"" timestamp with time zone NOT NULL DEFAULT TIMESTAMPTZ '-infinity';");
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""StockVariantId"" uuid;");
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""TotalCost"" numeric;");
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""Unit"" character varying(50) NOT NULL DEFAULT '';");
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""UnitCost"" numeric;");
            migrationBuilder.Sql(
                @"ALTER TABLE public.""StockMovements""
                  ADD COLUMN IF NOT EXISTS ""WarehouseId"" uuid;");

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "public",
                table: "StockCards",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "ToleranceType",
                schema: "public",
                table: "StockCards",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "StockNumber",
                schema: "public",
                table: "StockCards",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "StockCards",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "public",
                table: "StockCards",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "public",
                table: "StockCards",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""BarcodeGenerationType"" character varying(64);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""BarcodeRequired"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Brand"" character varying(128);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""BrandRequired"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""CriticalStockLevel"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""DefaultUnitId"" uuid;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""DefaultVatRate"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Description"" text;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""ExpiryTrackingEnabled"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""IsVariantBased"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""LotTrackingEnabled"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Manufacturer"" character varying(128);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""MaxStockLevel"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Model"" character varying(128);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""NodeType"" integer NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Notes"" text;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""PurchasePrice"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""PurchaseVatRate"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""SalesPrice"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""SalesVatRate"" numeric;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""SerialTrackingEnabled"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""ShortName"" character varying(128);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""Sku"" character varying(128);");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""SortOrder"" integer NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""StockNature"" integer;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""UnitId"" uuid;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockCards"" ADD COLUMN IF NOT EXISTS ""UsesVariants"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" ADD COLUMN IF NOT EXISTS ""AvailableQuantity"" numeric NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" ADD COLUMN IF NOT EXISTS ""QuantityOnHand"" numeric NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" ADD COLUMN IF NOT EXISTS ""ReservedQuantity"" numeric NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" ADD COLUMN IF NOT EXISTS ""StockVariantId"" uuid;");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" ADD COLUMN IF NOT EXISTS ""WarehouseId"" uuid;");

            // Clean up partially-created objects from failed previous runs.
            // This migration is currently used in environments where schema drift exists.
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""FaultReportPhotos"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""StockVariantAttributeValues"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""StockCardAttributes"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""StockAttributeOptions"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""StockVariants"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""StockAttributes"" CASCADE;");
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS public.""FaultReports"" CASCADE;");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockMovements_LocationId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockMovements_StockVariantId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockMovements_TenantId_MovementType_CreatedAt"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockMovements_TenantId_StockCardId_StockVariantId_CreatedAt"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockCards_TenantId_Barcode"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockCards_TenantId_NodeType"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockCards_TenantId_ParentId_NodeType"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockCards_TenantId_Sku"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockCards_TenantId_StockNumber"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockBalances_StockVariantId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS public.""IX_StockBalances_TenantId_StockCardId_StockVariantId_LocationId"";");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockBalances"" DROP CONSTRAINT IF EXISTS ""FK_StockBalances_StockVariants_StockVariantId"";");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockMovements"" DROP CONSTRAINT IF EXISTS ""FK_StockMovements_Locations_LocationId"";");
            migrationBuilder.Sql(@"ALTER TABLE public.""StockMovements"" DROP CONSTRAINT IF EXISTS ""FK_StockMovements_StockVariants_StockVariantId"";");

            migrationBuilder.CreateTable(
                name: "FaultReports",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    LocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReportedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LinkedWorkOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FaultReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FaultReports_Assets_AssetId",
                        column: x => x.AssetId,
                        principalSchema: "public",
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FaultReports_Locations_LocationId",
                        column: x => x.LocationId,
                        principalSchema: "public",
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FaultReports_WorkOrders_LinkedWorkOrderId",
                        column: x => x.LinkedWorkOrderId,
                        principalSchema: "public",
                        principalTable: "WorkOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StockAttributes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockAttributes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StockVariants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Sku = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Barcode = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    VariantSummary = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    VariantKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PriceAdjustment = table.Column<decimal>(type: "numeric", nullable: false),
                    PurchasePriceOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    SalesPriceOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    MinStockLevelOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    MaxStockLevelOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalStockLevelOverride = table.Column<decimal>(type: "numeric", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockVariants_StockCards_StockCardId",
                        column: x => x.StockCardId,
                        principalSchema: "public",
                        principalTable: "StockCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FaultReportPhotos",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FaultReportId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Base64Data = table.Column<string>(type: "text", nullable: false),
                    GpsLat = table.Column<decimal>(type: "numeric(10,6)", precision: 10, scale: 6, nullable: false),
                    GpsLng = table.Column<decimal>(type: "numeric(10,6)", precision: 10, scale: 6, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FaultReportPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FaultReportPhotos_FaultReports_FaultReportId",
                        column: x => x.FaultReportId,
                        principalSchema: "public",
                        principalTable: "FaultReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StockAttributeOptions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockAttributeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    DisplayValue = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockAttributeOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockAttributeOptions_StockAttributes_StockAttributeId",
                        column: x => x.StockAttributeId,
                        principalSchema: "public",
                        principalTable: "StockAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockCardAttributes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    StockAttributeId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockCardAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockCardAttributes_StockAttributes_StockAttributeId",
                        column: x => x.StockAttributeId,
                        principalSchema: "public",
                        principalTable: "StockAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockCardAttributes_StockCards_StockCardId",
                        column: x => x.StockCardId,
                        principalSchema: "public",
                        principalTable: "StockCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockVariantAttributeValues",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockVariantId = table.Column<Guid>(type: "uuid", nullable: false),
                    StockAttributeId = table.Column<Guid>(type: "uuid", nullable: false),
                    StockAttributeOptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ChangeIp = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockVariantAttributeValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockVariantAttributeValues_StockAttributeOptions_StockAttr~",
                        column: x => x.StockAttributeOptionId,
                        principalSchema: "public",
                        principalTable: "StockAttributeOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockVariantAttributeValues_StockAttributes_StockAttributeId",
                        column: x => x.StockAttributeId,
                        principalSchema: "public",
                        principalTable: "StockAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockVariantAttributeValues_StockVariants_StockVariantId",
                        column: x => x.StockVariantId,
                        principalSchema: "public",
                        principalTable: "StockVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_LocationId",
                schema: "public",
                table: "StockMovements",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_StockVariantId",
                schema: "public",
                table: "StockMovements",
                column: "StockVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_MovementType_CreatedAt",
                schema: "public",
                table: "StockMovements",
                columns: new[] { "TenantId", "MovementType", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId_StockCardId_StockVariantId_CreatedAt",
                schema: "public",
                table: "StockMovements",
                columns: new[] { "TenantId", "StockCardId", "StockVariantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_TenantId_Barcode",
                schema: "public",
                table: "StockCards",
                columns: new[] { "TenantId", "Barcode" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_TenantId_NodeType",
                schema: "public",
                table: "StockCards",
                columns: new[] { "TenantId", "NodeType" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_TenantId_ParentId_NodeType",
                schema: "public",
                table: "StockCards",
                columns: new[] { "TenantId", "ParentId", "NodeType" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_TenantId_Sku",
                schema: "public",
                table: "StockCards",
                columns: new[] { "TenantId", "Sku" });

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_TenantId_StockNumber",
                schema: "public",
                table: "StockCards",
                columns: new[] { "TenantId", "StockNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockBalances_StockVariantId",
                schema: "public",
                table: "StockBalances",
                column: "StockVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockBalances_TenantId_StockCardId_StockVariantId_LocationId",
                schema: "public",
                table: "StockBalances",
                columns: new[] { "TenantId", "StockCardId", "StockVariantId", "LocationId" });

            migrationBuilder.CreateIndex(
                name: "IX_FaultReportPhotos_FaultReportId",
                schema: "public",
                table: "FaultReportPhotos",
                column: "FaultReportId");

            migrationBuilder.CreateIndex(
                name: "IX_FaultReports_AssetId",
                schema: "public",
                table: "FaultReports",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_FaultReports_LinkedWorkOrderId",
                schema: "public",
                table: "FaultReports",
                column: "LinkedWorkOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_FaultReports_LocationId",
                schema: "public",
                table: "FaultReports",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_FaultReports_ReportedBy",
                schema: "public",
                table: "FaultReports",
                column: "ReportedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FaultReports_Status",
                schema: "public",
                table: "FaultReports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StockAttributeOptions_StockAttributeId",
                schema: "public",
                table: "StockAttributeOptions",
                column: "StockAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_StockAttributeOptions_TenantId_StockAttributeId_Code",
                schema: "public",
                table: "StockAttributeOptions",
                columns: new[] { "TenantId", "StockAttributeId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockAttributes_TenantId_Code",
                schema: "public",
                table: "StockAttributes",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockCardAttributes_StockAttributeId",
                schema: "public",
                table: "StockCardAttributes",
                column: "StockAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCardAttributes_StockCardId",
                schema: "public",
                table: "StockCardAttributes",
                column: "StockCardId");

            migrationBuilder.CreateIndex(
                name: "IX_StockCardAttributes_TenantId_StockCardId_StockAttributeId",
                schema: "public",
                table: "StockCardAttributes",
                columns: new[] { "TenantId", "StockCardId", "StockAttributeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockVariantAttributeValues_StockAttributeId",
                schema: "public",
                table: "StockVariantAttributeValues",
                column: "StockAttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_StockVariantAttributeValues_StockAttributeOptionId",
                schema: "public",
                table: "StockVariantAttributeValues",
                column: "StockAttributeOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_StockVariantAttributeValues_StockVariantId",
                schema: "public",
                table: "StockVariantAttributeValues",
                column: "StockVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockVariantAttributeValues_TenantId_StockVariantId_StockAt~",
                schema: "public",
                table: "StockVariantAttributeValues",
                columns: new[] { "TenantId", "StockVariantId", "StockAttributeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockVariants_StockCardId",
                schema: "public",
                table: "StockVariants",
                column: "StockCardId");

            migrationBuilder.CreateIndex(
                name: "IX_StockVariants_TenantId_Barcode",
                schema: "public",
                table: "StockVariants",
                columns: new[] { "TenantId", "Barcode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockVariants_TenantId_Sku",
                schema: "public",
                table: "StockVariants",
                columns: new[] { "TenantId", "Sku" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockVariants_TenantId_StockCardId_Code",
                schema: "public",
                table: "StockVariants",
                columns: new[] { "TenantId", "StockCardId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockVariants_TenantId_StockCardId_VariantKey",
                schema: "public",
                table: "StockVariants",
                columns: new[] { "TenantId", "StockCardId", "VariantKey" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_StockBalances_StockVariants_StockVariantId",
                schema: "public",
                table: "StockBalances",
                column: "StockVariantId",
                principalSchema: "public",
                principalTable: "StockVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Locations_LocationId",
                schema: "public",
                table: "StockMovements",
                column: "LocationId",
                principalSchema: "public",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_StockVariants_StockVariantId",
                schema: "public",
                table: "StockMovements",
                column: "StockVariantId",
                principalSchema: "public",
                principalTable: "StockVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockBalances_StockVariants_StockVariantId",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Locations_LocationId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_StockVariants_StockVariantId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropTable(
                name: "FaultReportPhotos",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StockCardAttributes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StockVariantAttributeValues",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FaultReports",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StockAttributeOptions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StockVariants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StockAttributes",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_LocationId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_StockVariantId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_TenantId_MovementType_CreatedAt",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_TenantId_StockCardId_StockVariantId_CreatedAt",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_TenantId_Barcode",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_TenantId_NodeType",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_TenantId_ParentId_NodeType",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_TenantId_Sku",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_TenantId_StockNumber",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockBalances_StockVariantId",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropIndex(
                name: "IX_StockBalances_TenantId_StockCardId_StockVariantId_LocationId",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "LocationId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "PerformedAt",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "StockVariantId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "TotalCost",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "Unit",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                schema: "public",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "BarcodeGenerationType",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "BarcodeRequired",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Brand",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "BrandRequired",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "CriticalStockLevel",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "DefaultUnitId",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "DefaultVatRate",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "ExpiryTrackingEnabled",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "IsVariantBased",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "LotTrackingEnabled",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Manufacturer",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "MaxStockLevel",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Model",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "NodeType",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "PurchaseVatRate",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "SalesPrice",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "SalesVatRate",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "SerialTrackingEnabled",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "ShortName",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "Sku",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "StockNature",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "UnitId",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "UsesVariants",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "AvailableQuantity",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "QuantityOnHand",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "ReservedQuantity",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "StockVariantId",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "WarehouseId",
                schema: "public",
                table: "StockBalances");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                schema: "public",
                table: "StockMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ToleranceType",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32);

            migrationBuilder.AlterColumn<string>(
                name: "StockNumber",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8)",
                oldMaxLength: 8);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }
    }
}
