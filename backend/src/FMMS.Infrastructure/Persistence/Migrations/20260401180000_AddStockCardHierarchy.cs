using System;
using FMMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(FmmsDbContext))]
    [Migration("20260401180000_AddStockCardHierarchy")]
    public partial class AddStockCardHierarchy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HierarchyLevel",
                schema: "public",
                table: "StockCards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "HierarchyPath",
                schema: "public",
                table: "StockCards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                schema: "public",
                table: "StockCards",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockCards_ParentId",
                schema: "public",
                table: "StockCards",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_StockCards_StockCards_ParentId",
                schema: "public",
                table: "StockCards",
                column: "ParentId",
                principalSchema: "public",
                principalTable: "StockCards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockCards_StockCards_ParentId",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropIndex(
                name: "IX_StockCards_ParentId",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "HierarchyLevel",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "HierarchyPath",
                schema: "public",
                table: "StockCards");

            migrationBuilder.DropColumn(
                name: "ParentId",
                schema: "public",
                table: "StockCards");
        }
    }
}
