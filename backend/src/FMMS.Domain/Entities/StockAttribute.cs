using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockAttribute : AuditableEntity, ITenantScoped
{
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<StockAttributeOption> Options { get; set; } = new List<StockAttributeOption>();
    public ICollection<StockCardAttribute> StockCardAttributes { get; set; } = new List<StockCardAttribute>();
}
