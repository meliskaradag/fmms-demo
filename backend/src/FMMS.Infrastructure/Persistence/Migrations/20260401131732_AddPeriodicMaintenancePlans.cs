using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FMMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPeriodicMaintenancePlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MaintenancePlanId",
                schema: "public",
                table: "WorkOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MaintenancePlans",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MaintenanceCardId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggerType = table.Column<int>(type: "integer", nullable: false),
                    FrequencyDays = table.Column<int>(type: "integer", nullable: true),
                    MeterInterval = table.Column<decimal>(type: "numeric", nullable: true),
                    CurrentMeterReading = table.Column<decimal>(type: "numeric", nullable: false),
                    NextDueAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextDueMeter = table.Column<decimal>(type: "numeric", nullable: true),
                    LastRunAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_MaintenancePlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenancePlans_Assets_AssetId",
                        column: x => x.AssetId,
                        principalSchema: "public",
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenancePlans_MaintenanceCards_MaintenanceCardId",
                        column: x => x.MaintenanceCardId,
                        principalSchema: "public",
                        principalTable: "MaintenanceCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MaintenancePlanRuns",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaintenancePlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TriggerReason = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    MissingMaterialsJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_MaintenancePlanRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenancePlanRuns_MaintenancePlans_MaintenancePlanId",
                        column: x => x.MaintenancePlanId,
                        principalSchema: "public",
                        principalTable: "MaintenancePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenancePlanRuns_WorkOrders_WorkOrderId",
                        column: x => x.WorkOrderId,
                        principalSchema: "public",
                        principalTable: "WorkOrders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkOrders_MaintenancePlanId",
                schema: "public",
                table: "WorkOrders",
                column: "MaintenancePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlanRuns_MaintenancePlanId",
                schema: "public",
                table: "MaintenancePlanRuns",
                column: "MaintenancePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlanRuns_WorkOrderId",
                schema: "public",
                table: "MaintenancePlanRuns",
                column: "WorkOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_AssetId",
                schema: "public",
                table: "MaintenancePlans",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_MaintenanceCardId",
                schema: "public",
                table: "MaintenancePlans",
                column: "MaintenanceCardId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkOrders_MaintenancePlans_MaintenancePlanId",
                schema: "public",
                table: "WorkOrders",
                column: "MaintenancePlanId",
                principalSchema: "public",
                principalTable: "MaintenancePlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkOrders_MaintenancePlans_MaintenancePlanId",
                schema: "public",
                table: "WorkOrders");

            migrationBuilder.DropTable(
                name: "MaintenancePlanRuns",
                schema: "public");

            migrationBuilder.DropTable(
                name: "MaintenancePlans",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_WorkOrders_MaintenancePlanId",
                schema: "public",
                table: "WorkOrders");

            migrationBuilder.DropColumn(
                name: "MaintenancePlanId",
                schema: "public",
                table: "WorkOrders");
        }
    }
}
