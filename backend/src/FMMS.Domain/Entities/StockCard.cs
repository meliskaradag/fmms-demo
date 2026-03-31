using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class StockCard : AuditableEntity, ITenantScoped
{
    public string StockNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Barcode { get; set; }
    public string Category { get; set; } = default!;
    public string Unit { get; set; } = "adet";
    public decimal MinStockLevel { get; set; }
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Spec2000Code { get; set; }
    public string? ManufacturerBarcode { get; set; }
    public CodeSource CodeSource { get; set; }
    public Guid? BaseUnitId { get; set; }
    public decimal ToleranceValue { get; set; }
    public string ToleranceType { get; set; } = "absolute";
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<StockBalance> Balances { get; set; } = new List<StockBalance>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
}
