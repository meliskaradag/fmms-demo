using FMMS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FMMS.Infrastructure.Persistence;

public class FmmsDbContextFactory : IDesignTimeDbContextFactory<FmmsDbContext>
{
    public FmmsDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=15432;Database=fmms_db;Username=fmms;Password=fmms_dev_2026";

        var optionsBuilder = new DbContextOptionsBuilder<FmmsDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        var tenantContext = new TenantContext
        {
            TenantId = Guid.Empty,
            TenantSlug = "design-time",
            SchemaName = "public"
        };

        return new FmmsDbContext(optionsBuilder.Options, tenantContext);
    }
}
