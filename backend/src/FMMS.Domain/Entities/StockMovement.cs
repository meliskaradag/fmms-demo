using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class StockMovement : AuditableEntity, ITenantScoped
{
    public Guid StockCardId { get; set; }
    public MovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public Guid? FromLocationId { get; set; }
    public Guid? ToLocationId { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public Guid PerformedBy { get; set; }

    // Navigation properties
    public StockCard StockCard { get; set; } = default!;
    public Location? FromLocation { get; set; }
    public Location? ToLocation { get; set; }
}
