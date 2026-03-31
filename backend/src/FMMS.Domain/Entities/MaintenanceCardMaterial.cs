using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class MaintenanceCardMaterial : AuditableEntity, ITenantScoped
{
    public Guid CardId { get; set; }
    public Guid StockCardId { get; set; }
    public decimal Quantity { get; set; }

    // Navigation properties
    public MaintenanceCard Card { get; set; } = default!;
    public StockCard StockCard { get; set; } = default!;
}
