namespace FMMS.Application.DTOs;

public class StockVariantDto
{
    public Guid Id { get; set; }
    public Guid StockCardId { get; set; }
    public string Code { get; set; } = default!;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public string Name { get; set; } = default!;
    public string? VariantSummary { get; set; }
    public decimal PriceAdjustment { get; set; }
    public decimal? PurchasePriceOverride { get; set; }
    public decimal? SalesPriceOverride { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
