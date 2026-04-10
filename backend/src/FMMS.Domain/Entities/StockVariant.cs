using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class StockVariant : AuditableEntity, ITenantScoped
{
    public Guid StockCardId { get; set; }
    public string Code { get; set; } = default!;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public string Name { get; set; } = default!;
    public string? VariantSummary { get; set; }
    public string VariantKey { get; set; } = default!;
    public decimal PriceAdjustment { get; set; }
    public decimal? PurchasePriceOverride { get; set; }
    public decimal? SalesPriceOverride { get; set; }
    public decimal? MinStockLevelOverride { get; set; }
    public decimal? MaxStockLevelOverride { get; set; }
    public decimal? CriticalStockLevelOverride { get; set; }
    public bool IsActive { get; set; } = true;

    public StockCard StockCard { get; set; } = default!;
    public ICollection<StockVariantAttributeValue> AttributeValues { get; set; } = new List<StockVariantAttributeValue>();
    public ICollection<StockBalance> Balances { get; set; } = new List<StockBalance>();
    public ICollection<StockMovement> Movements { get; set; } = new List<StockMovement>();
}
