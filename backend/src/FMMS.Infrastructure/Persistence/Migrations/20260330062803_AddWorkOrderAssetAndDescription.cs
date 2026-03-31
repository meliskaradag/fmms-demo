using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkOrderAssetAndDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssetId",
                schema: "public",
                table: "WorkOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "public",
                table: "WorkOrders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_AssetId",
                schema: "public",
                table: "WorkOrders",
                column: "AssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkOrders_Assets_AssetId",
                schema: "public",
                table: "WorkOrders",
                column: "AssetId",
                principalSchema: "public",
                principalTable: "Assets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkOrders_Assets_AssetId",
                schema: "public",
                table: "WorkOrders");

            migrationBuilder.DropIndex(
                name: "IX_WorkOrders_AssetId",
                schema: "public",
                table: "WorkOrders");

            migrationBuilder.DropColumn(
                name: "AssetId",
                schema: "public",
                table: "WorkOrders");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "public",
                table: "WorkOrders");
        }
    }
}
