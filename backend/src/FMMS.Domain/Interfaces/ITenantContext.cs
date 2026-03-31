namespace FMMS.Domain.Interfaces;

public interface ITenantContext
{
    Guid TenantId { get; set; }
    string TenantSlug { get; set; }
    string SchemaName { get; set; }
}
