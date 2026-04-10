using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockVariantAttributeValue : AuditableEntity, ITenantScoped
{
    public Guid StockVariantId { get; set; }
    public Guid StockAttributeId { get; set; }
    public Guid StockAttributeOptionId { get; set; }

    public StockVariant StockVariant { get; set; } = default!;
    public StockAttribute StockAttribute { get; set; } = default!;
    public StockAttributeOption StockAttributeOption { get; set; } = default!;
}
