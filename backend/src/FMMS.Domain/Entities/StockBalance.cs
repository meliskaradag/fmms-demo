using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockBalance : AuditableEntity, ITenantScoped
{
    public Guid StockCardId { get; set; }
    public Guid LocationId { get; set; }
    public decimal CurrentStock { get; set; }

    // Navigation properties
    public StockCard StockCard { get; set; } = default!;
    public Location Location { get; set; } = default!;
}
