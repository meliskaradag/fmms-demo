using FMMS.Domain.Common;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Infrastructure.Persistence;

public class FmmsDbContext : DbContext
{
    private readonly ITenantContext _tenantContext;

    public FmmsDbContext(DbContextOptions<FmmsDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<AssetHistory> AssetHistories => Set<AssetHistory>();
    public DbSet<AssetMovement> AssetMovements => Set<AssetMovement>();
    public DbSet<FileObject> FileObjects => Set<FileObject>();
    public DbSet<StockCard> StockCards => Set<StockCard>();
    public DbSet<StockVariant> StockVariants => Set<StockVariant>();
    public DbSet<StockAttribute> StockAttributes => Set<StockAttribute>();
    public DbSet<StockAttributeOption> StockAttributeOptions => Set<StockAttributeOption>();
    public DbSet<StockCardAttribute> StockCardAttributes => Set<StockCardAttribute>();
    public DbSet<StockVariantAttributeValue> StockVariantAttributeValues => Set<StockVariantAttributeValue>();
    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<MaintenanceCard> MaintenanceCards => Set<MaintenanceCard>();
    public DbSet<MaintenanceCardStep> MaintenanceCardSteps => Set<MaintenanceCardStep>();
    public DbSet<MaintenanceCardMaterial> MaintenanceCardMaterials => Set<MaintenanceCardMaterial>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<ServiceAgreement> ServiceAgreements => Set<ServiceAgreement>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<WorkOrderPhoto> WorkOrderPhotos => Set<WorkOrderPhoto>();
    public DbSet<WorkOrderAssignee> WorkOrderAssignees => Set<WorkOrderAssignee>();
    public DbSet<MaintenancePlan> MaintenancePlans => Set<MaintenancePlan>();
    public DbSet<MaintenancePlanRun> MaintenancePlanRuns => Set<MaintenancePlanRun>();
    public DbSet<FaultReport> FaultReports => Set<FaultReport>();
    public DbSet<FaultReportPhoto> FaultReportPhotos => Set<FaultReportPhoto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Set default schema from tenant context
        modelBuilder.HasDefaultSchema(_tenantContext.SchemaName);

        // Tenants table always stays in "public" schema
        modelBuilder.Entity<Tenant>().ToTable("Tenants", "public");

        // Apply all entity configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FmmsDbContext).Assembly);

        // Add global query filter for soft delete on all AuditableEntity types
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(FmmsDbContext)
                    .GetMethod(nameof(ApplySoftDeleteFilter),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);

                method.Invoke(null, new object[] { modelBuilder });
            }
        }
    }

    private static void ApplySoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
        where TEntity : AuditableEntity
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(entity => !entity.IsDeleted);
    }
}
