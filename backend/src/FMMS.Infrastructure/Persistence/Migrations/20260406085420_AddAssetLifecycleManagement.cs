using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetLifecycleManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Assets_ParentAssetId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Locations_LocationId",
                schema: "public",
                table: "Assets");

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Assets",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Model",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Manufacturer",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "BatchNumber",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Barcode",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssetNumber",
                schema: "public",
                table: "Assets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "AssetTag",
                schema: "public",
                table: "Assets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE \"public\".\"Assets\" SET \"AssetTag\" = \"AssetNumber\" WHERE \"AssetTag\" = '' OR \"AssetTag\" IS NULL;");

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId",
                schema: "public",
                table: "Assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                schema: "public",
                table: "Assets",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Condition",
                schema: "public",
                table: "Assets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                schema: "public",
                table: "Assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemId",
                schema: "public",
                table: "Assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchaseCost",
                schema: "public",
                table: "Assets",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate",
                schema: "public",
                table: "Assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QrCode",
                schema: "public",
                table: "Assets",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Specifications",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SupplierId",
                schema: "public",
                table: "Assets",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyEndDate",
                schema: "public",
                table: "Assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyStartDate",
                schema: "public",
                table: "Assets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AssetHistories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    PerformedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReferenceType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ReferenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_AssetHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetHistories_Assets_AssetId",
                        column: x => x.AssetId,
                        principalSchema: "public",
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssetMovements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    MovementType = table.Column<int>(type: "integer", nullable: false),
                    FromLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ToLocationId = table.Column<Guid>(type: "uuid", nullable: true),
                    FromUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    MovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_AssetMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetMovements_Assets_AssetId",
                        column: x => x.AssetId,
                        principalSchema: "public",
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssetTag",
                schema: "public",
                table: "Assets",
                column: "AssetTag",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssignedToUserId",
                schema: "public",
                table: "Assets",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_SerialNumber",
                schema: "public",
                table: "Assets",
                column: "SerialNumber",
                unique: true,
                filter: "\"SerialNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Status",
                schema: "public",
                table: "Assets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_WarrantyEndDate",
                schema: "public",
                table: "Assets",
                column: "WarrantyEndDate");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Assets_ParentNotSelf",
                schema: "public",
                table: "Assets",
                sql: "\"ParentAssetId\" IS NULL OR \"ParentAssetId\" <> \"Id\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Assets_WarrantyDateRange",
                schema: "public",
                table: "Assets",
                sql: "\"WarrantyStartDate\" IS NULL OR \"WarrantyEndDate\" IS NULL OR \"WarrantyEndDate\" > \"WarrantyStartDate\"");

            migrationBuilder.CreateIndex(
                name: "IX_AssetHistories_ActionType",
                schema: "public",
                table: "AssetHistories",
                column: "ActionType");

            migrationBuilder.CreateIndex(
                name: "IX_AssetHistories_AssetId_PerformedAt",
                schema: "public",
                table: "AssetHistories",
                columns: new[] { "AssetId", "PerformedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_AssetId_MovedAt",
                schema: "public",
                table: "AssetMovements",
                columns: new[] { "AssetId", "MovedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_MovementType",
                schema: "public",
                table: "AssetMovements",
                column: "MovementType");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_ToLocationId",
                schema: "public",
                table: "AssetMovements",
                column: "ToLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetMovements_ToUserId",
                schema: "public",
                table: "AssetMovements",
                column: "ToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Assets_ParentAssetId",
                schema: "public",
                table: "Assets",
                column: "ParentAssetId",
                principalSchema: "public",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Locations_LocationId",
                schema: "public",
                table: "Assets",
                column: "LocationId",
                principalSchema: "public",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Assets_ParentAssetId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_Assets_Locations_LocationId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropForeignKey(
                name: "FK_StockCards_StockCards_ParentId",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropTable(
                name: "AssetHistories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "AssetMovements",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Assets_AssetTag",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_AssignedToUserId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_SerialNumber",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_Status",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_WarrantyEndDate",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Assets_ParentNotSelf",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Assets_WarrantyDateRange",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "AssetTag",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Brand",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Condition",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "ItemId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "PurchaseCost",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "QrCode",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Specifications",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "SupplierId",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "WarrantyEndDate",
                schema: "public",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "WarrantyStartDate",
                schema: "public",
                table: "Assets");

            migrationBuilder.AlterColumn<string>(
                name: "SerialNumber",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Model",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<string>(
                name: "Manufacturer",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<string>(
                name: "BatchNumber",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128);

            migrationBuilder.AlterColumn<string>(
                name: "Barcode",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AssetNumber",
                schema: "public",
                table: "Assets",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Assets_ParentAssetId",
                schema: "public",
                table: "Assets",
                column: "ParentAssetId",
                principalSchema: "public",
                principalTable: "Assets",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Assets_Locations_LocationId",
                schema: "public",
                table: "Assets",
                column: "LocationId",
                principalSchema: "public",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
