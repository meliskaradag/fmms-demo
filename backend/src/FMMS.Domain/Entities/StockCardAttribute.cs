using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockCardAttribute : AuditableEntity, ITenantScoped
{
    public Guid StockCardId { get; set; }
    public Guid StockAttributeId { get; set; }
    public bool IsRequired { get; set; } = true;
    public int SortOrder { get; set; }

    public StockCard StockCard { get; set; } = default!;
    public StockAttribute StockAttribute { get; set; } = default!;
}
