using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStockCardIdToMaintenancePlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StockCardId",
                schema: "public",
                table: "MaintenancePlans",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_StockCardId",
                schema: "public",
                table: "MaintenancePlans",
                column: "StockCardId");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenancePlans_StockCards_StockCardId",
                schema: "public",
                table: "MaintenancePlans",
                column: "StockCardId",
                principalSchema: "public",
                principalTable: "StockCards",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenancePlans_StockCards_StockCardId",
                schema: "public",
                table: "MaintenancePlans");

            migrationBuilder.DropIndex(
                name: "IX_MaintenancePlans_StockCardId",
                schema: "public",
                table: "MaintenancePlans");

            migrationBuilder.DropColumn(
                name: "StockCardId",
                schema: "public",
                table: "MaintenancePlans");
        }
    }
}
