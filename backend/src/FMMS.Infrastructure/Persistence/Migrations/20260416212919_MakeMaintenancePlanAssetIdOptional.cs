using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MakeMaintenancePlanAssetIdOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenancePlans_Assets_AssetId",
                schema: "public",
                table: "MaintenancePlans");

            migrationBuilder.AlterColumn<Guid>(
                name: "AssetId",
                schema: "public",
                table: "MaintenancePlans",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenancePlans_Assets_AssetId",
                schema: "public",
                table: "MaintenancePlans",
                column: "AssetId",
                principalSchema: "public",
                principalTable: "Assets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenancePlans_Assets_AssetId",
                schema: "public",
                table: "MaintenancePlans");

            migrationBuilder.AlterColumn<Guid>(
                name: "AssetId",
                schema: "public",
                table: "MaintenancePlans",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenancePlans_Assets_AssetId",
                schema: "public",
                table: "MaintenancePlans",
                column: "AssetId",
                principalSchema: "public",
                principalTable: "Assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
