using FMMS.Domain.Enums;
using FMMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(FmmsDbContext))]
    [Migration("20260406160000_AddInventoryHierarchyAndVariants")]
    public partial class AddInventoryHierarchyAndVariants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "BarcodeGenerationType", schema: "public", table: "StockCards", type: "character varying(64)", maxLength: 64, nullable: true);
            migrationBuilder.AddColumn<bool>(name: "BarcodeRequired", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<string>(name: "Brand", schema: "public", table: "StockCards", type: "character varying(128)", maxLength: 128, nullable: true);
            migrationBuilder.AddColumn<bool>(name: "BrandRequired", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<decimal>(name: "CriticalStockLevel", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "DefaultUnitId", schema: "public", table: "StockCards", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "DefaultVatRate", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Description", schema: "public", table: "StockCards", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "ImageUrl", schema: "public", table: "StockCards", type: "text", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "IsVariantBased", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "ExpiryTrackingEnabled", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "LotTrackingEnabled", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<decimal>(name: "MaxStockLevel", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Model", schema: "public", table: "StockCards", type: "character varying(128)", maxLength: 128, nullable: true);
            migrationBuilder.AddColumn<string>(name: "Notes", schema: "public", table: "StockCards", type: "text", nullable: true);
            migrationBuilder.AddColumn<int>(name: "NodeType", schema: "public", table: "StockCards", type: "integer", nullable: false, defaultValue: (int)StockNodeType.StockCard);
            migrationBuilder.AddColumn<decimal>(name: "PurchasePrice", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "PurchaseVatRate", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "SalesPrice", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "SalesVatRate", schema: "public", table: "StockCards", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "SerialTrackingEnabled", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<string>(name: "ShortName", schema: "public", table: "StockCards", type: "character varying(128)", maxLength: 128, nullable: true);
            migrationBuilder.AddColumn<int>(name: "SortOrder", schema: "public", table: "StockCards", type: "integer", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<string>(name: "Sku", schema: "public", table: "StockCards", type: "character varying(128)", maxLength: 128, nullable: true);
            migrationBuilder.AddColumn<int>(name: "StockNature", schema: "public", table: "StockCards", type: "integer", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "UnitId", schema: "public", table: "StockCards", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "UsesVariants", schema: "public", table: "StockCards", type: "boolean", nullable: false, defaultValue: false);

            migrationBuilder.AddColumn<decimal>(name: "AvailableQuantity", schema: "public", table: "StockBalances", type: "numeric", nullable: false, defaultValue: 0m);
            migrationBuilder.AddColumn<decimal>(name: "QuantityOnHand", schema: "public", table: "StockBalances", type: "numeric", nullable: false, defaultValue: 0m);
            migrationBuilder.AddColumn<decimal>(name: "ReservedQuantity", schema: "public", table: "StockBalances", type: "numeric", nullable: false, defaultValue: 0m);
            migrationBuilder.AddColumn<Guid>(name: "StockVariantId", schema: "public", table: "StockBalances", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "WarehouseId", schema: "public", table: "StockBalances", type: "uuid", nullable: true);

            migrationBuilder.AddColumn<Guid>(name: "LocationId", schema: "public", table: "StockMovements", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "PerformedAt", schema: "public", table: "StockMovements", type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()");
            migrationBuilder.AddColumn<Guid>(name: "StockVariantId", schema: "public", table: "StockMovements", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "TotalCost", schema: "public", table: "StockMovements", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Unit", schema: "public", table: "StockMovements", type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "adet");
            migrationBuilder.AddColumn<decimal>(name: "UnitCost", schema: "public", table: "StockMovements", type: "numeric", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "WarehouseId", schema: "public", table: "StockMovements", type: "uuid", nullable: true);

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
                constraints: table => { table.PrimaryKey("PK_StockAttributes", x => x.Id); });

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
                        name: "FK_StockVariantAttributeValues_StockAttributeOptions_StockAttributeOptionId",
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

            migrationBuilder.CreateIndex(name: "IX_StockBalances_StockVariantId", schema: "public", table: "StockBalances", column: "StockVariantId");
            migrationBuilder.CreateIndex(name: "IX_StockMovements_LocationId", schema: "public", table: "StockMovements", column: "LocationId");
            migrationBuilder.CreateIndex(name: "IX_StockMovements_StockVariantId", schema: "public", table: "StockMovements", column: "StockVariantId");
            migrationBuilder.CreateIndex(name: "IX_StockCards_TenantId_Barcode", schema: "public", table: "StockCards", columns: new[] { "TenantId", "Barcode" });
            migrationBuilder.CreateIndex(name: "IX_StockCards_TenantId_NodeType", schema: "public", table: "StockCards", columns: new[] { "TenantId", "NodeType" });
            migrationBuilder.CreateIndex(name: "IX_StockCards_TenantId_ParentId_NodeType", schema: "public", table: "StockCards", columns: new[] { "TenantId", "ParentId", "NodeType" });
            migrationBuilder.CreateIndex(name: "IX_StockCards_TenantId_Sku", schema: "public", table: "StockCards", columns: new[] { "TenantId", "Sku" });
            migrationBuilder.CreateIndex(name: "IX_StockCards_TenantId_StockNumber", schema: "public", table: "StockCards", columns: new[] { "TenantId", "StockNumber" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockAttributes_TenantId_Code", schema: "public", table: "StockAttributes", columns: new[] { "TenantId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockAttributeOptions_StockAttributeId", schema: "public", table: "StockAttributeOptions", column: "StockAttributeId");
            migrationBuilder.CreateIndex(name: "IX_StockAttributeOptions_TenantId_StockAttributeId_Code", schema: "public", table: "StockAttributeOptions", columns: new[] { "TenantId", "StockAttributeId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockCardAttributes_StockAttributeId", schema: "public", table: "StockCardAttributes", column: "StockAttributeId");
            migrationBuilder.CreateIndex(name: "IX_StockCardAttributes_StockCardId", schema: "public", table: "StockCardAttributes", column: "StockCardId");
            migrationBuilder.CreateIndex(name: "IX_StockCardAttributes_TenantId_StockCardId_StockAttributeId", schema: "public", table: "StockCardAttributes", columns: new[] { "TenantId", "StockCardId", "StockAttributeId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockVariantAttributeValues_StockAttributeId", schema: "public", table: "StockVariantAttributeValues", column: "StockAttributeId");
            migrationBuilder.CreateIndex(name: "IX_StockVariantAttributeValues_StockAttributeOptionId", schema: "public", table: "StockVariantAttributeValues", column: "StockAttributeOptionId");
            migrationBuilder.CreateIndex(name: "IX_StockVariantAttributeValues_StockVariantId", schema: "public", table: "StockVariantAttributeValues", column: "StockVariantId");
            migrationBuilder.CreateIndex(name: "IX_StockVariantAttributeValues_TenantId_StockVariantId_StockAttributeId", schema: "public", table: "StockVariantAttributeValues", columns: new[] { "TenantId", "StockVariantId", "StockAttributeId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockVariants_StockCardId", schema: "public", table: "StockVariants", column: "StockCardId");
            migrationBuilder.CreateIndex(name: "IX_StockVariants_TenantId_Barcode", schema: "public", table: "StockVariants", columns: new[] { "TenantId", "Barcode" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockVariants_TenantId_Sku", schema: "public", table: "StockVariants", columns: new[] { "TenantId", "Sku" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockVariants_TenantId_StockCardId_Code", schema: "public", table: "StockVariants", columns: new[] { "TenantId", "StockCardId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_StockVariants_TenantId_StockCardId_VariantKey", schema: "public", table: "StockVariants", columns: new[] { "TenantId", "StockCardId", "VariantKey" }, unique: true);

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

            migrationBuilder.Sql(@"
                UPDATE public.""StockCards""
                SET ""NodeType"" = 2
                WHERE ""NodeType"" IS NULL;

                UPDATE public.""StockBalances""
                SET ""QuantityOnHand"" = ""CurrentStock"",
                    ""AvailableQuantity"" = ""CurrentStock"",
                    ""ReservedQuantity"" = 0
                WHERE ""QuantityOnHand"" = 0 AND ""AvailableQuantity"" = 0;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_StockBalances_StockVariants_StockVariantId", schema: "public", table: "StockBalances");
            migrationBuilder.DropForeignKey(name: "FK_StockMovements_Locations_LocationId", schema: "public", table: "StockMovements");
            migrationBuilder.DropForeignKey(name: "FK_StockMovements_StockVariants_StockVariantId", schema: "public", table: "StockMovements");

            migrationBuilder.DropTable(name: "StockCardAttributes", schema: "public");
            migrationBuilder.DropTable(name: "StockVariantAttributeValues", schema: "public");
            migrationBuilder.DropTable(name: "StockAttributeOptions", schema: "public");
            migrationBuilder.DropTable(name: "StockVariants", schema: "public");
            migrationBuilder.DropTable(name: "StockAttributes", schema: "public");

            migrationBuilder.DropIndex(name: "IX_StockBalances_StockVariantId", schema: "public", table: "StockBalances");
            migrationBuilder.DropIndex(name: "IX_StockMovements_LocationId", schema: "public", table: "StockMovements");
            migrationBuilder.DropIndex(name: "IX_StockMovements_StockVariantId", schema: "public", table: "StockMovements");
            migrationBuilder.DropIndex(name: "IX_StockCards_TenantId_Barcode", schema: "public", table: "StockCards");
            migrationBuilder.DropIndex(name: "IX_StockCards_TenantId_NodeType", schema: "public", table: "StockCards");
            migrationBuilder.DropIndex(name: "IX_StockCards_TenantId_ParentId_NodeType", schema: "public", table: "StockCards");
            migrationBuilder.DropIndex(name: "IX_StockCards_TenantId_Sku", schema: "public", table: "StockCards");
            migrationBuilder.DropIndex(name: "IX_StockCards_TenantId_StockNumber", schema: "public", table: "StockCards");

            migrationBuilder.DropColumn(name: "BarcodeGenerationType", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "BarcodeRequired", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "Brand", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "BrandRequired", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "CriticalStockLevel", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "DefaultUnitId", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "DefaultVatRate", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "Description", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "ExpiryTrackingEnabled", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "ImageUrl", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "IsVariantBased", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "LotTrackingEnabled", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "MaxStockLevel", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "Model", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "NodeType", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "Notes", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "PurchasePrice", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "PurchaseVatRate", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "SalesPrice", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "SalesVatRate", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "SerialTrackingEnabled", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "ShortName", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "Sku", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "SortOrder", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "StockNature", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "UnitId", schema: "public", table: "StockCards");
            migrationBuilder.DropColumn(name: "UsesVariants", schema: "public", table: "StockCards");

            migrationBuilder.DropColumn(name: "AvailableQuantity", schema: "public", table: "StockBalances");
            migrationBuilder.DropColumn(name: "QuantityOnHand", schema: "public", table: "StockBalances");
            migrationBuilder.DropColumn(name: "ReservedQuantity", schema: "public", table: "StockBalances");
            migrationBuilder.DropColumn(name: "StockVariantId", schema: "public", table: "StockBalances");
            migrationBuilder.DropColumn(name: "WarehouseId", schema: "public", table: "StockBalances");

            migrationBuilder.DropColumn(name: "LocationId", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "PerformedAt", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "StockVariantId", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "TotalCost", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "Unit", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "UnitCost", schema: "public", table: "StockMovements");
            migrationBuilder.DropColumn(name: "WarehouseId", schema: "public", table: "StockMovements");
        }
    }
}
