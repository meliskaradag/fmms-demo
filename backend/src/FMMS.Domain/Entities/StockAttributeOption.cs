using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockAttributeOption : AuditableEntity, ITenantScoped
{
    public Guid StockAttributeId { get; set; }
    public string Code { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string? DisplayValue { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public StockAttribute StockAttribute { get; set; } = default!;
    public ICollection<StockVariantAttributeValue> VariantValues { get; set; } = new List<StockVariantAttributeValue>();
}
