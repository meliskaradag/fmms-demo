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
    public decimal? MaxStockLevel { get; set; }
    public decimal? CriticalStockLevel { get; set; }
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "TRY";
    public string? Spec2000Code { get; set; }
    public string? ManufacturerBarcode { get; set; }
    public CodeSource CodeSource { get; set; }
    public Guid? BaseUnitId { get; set; }
    public decimal ToleranceValue { get; set; }
    public string ToleranceType { get; set; } = "absolute";
    public bool IsActive { get; set; } = true;
    public Guid? ParentId { get; set; }
    public int HierarchyLevel { get; set; }
    public string HierarchyPath { get; set; } = default!;
    public StockNodeType NodeType { get; set; } = StockNodeType.StockCard;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public Guid? DefaultUnitId { get; set; }
    public decimal? DefaultVatRate { get; set; }
    public StockNatureType? StockNature { get; set; }
    public bool UsesVariants { get; set; }
    public bool BarcodeRequired { get; set; }
    public bool BrandRequired { get; set; }
    public bool SerialTrackingEnabled { get; set; }
    public bool LotTrackingEnabled { get; set; }
    public bool ExpiryTrackingEnabled { get; set; }
    public string? ShortName { get; set; }
    public string? Brand { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public Guid? UnitId { get; set; }
    public decimal? PurchaseVatRate { get; set; }
    public decimal? SalesVatRate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? SalesPrice { get; set; }
    public bool IsVariantBased { get; set; }
    public string? BarcodeGenerationType { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
    public string? Sku { get; set; }

    // Navigation properties
    public StockCard? Parent { get; set; }
    public ICollection<StockCard> Children { get; set; } = new List<StockCard>();
    public ICollection<StockBalance> Balances { get; set; } = new List<StockBalance>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
    public ICollection<StockVariant> Variants { get; set; } = new List<StockVariant>();
    public ICollection<StockCardAttribute> Attributes { get; set; } = new List<StockCardAttribute>();
}
