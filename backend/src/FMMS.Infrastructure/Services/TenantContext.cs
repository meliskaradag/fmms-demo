using FMMS.Domain.Interfaces;

namespace FMMS.Infrastructure.Services;

public class TenantContext : ITenantContext
{
    public Guid TenantId { get; set; }
    public string TenantSlug { get; set; } = string.Empty;
    public string SchemaName { get; set; } = "public";
}
