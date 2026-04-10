using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockBalance : AuditableEntity, ITenantScoped
{
    public Guid StockCardId { get; set; }
    public Guid? StockVariantId { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid LocationId { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal QuantityOnHand { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }

    // Navigation properties
    public StockCard StockCard { get; set; } = default!;
    public StockVariant? StockVariant { get; set; }
    public Location Location { get; set; } = default!;
}
