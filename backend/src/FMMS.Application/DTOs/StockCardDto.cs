namespace FMMS.Application.DTOs;

public class StockCardDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string NodeType { get; set; } = "STOCK_CARD";
    public string StockNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Barcode { get; set; }
    public string? Sku { get; set; }
    public string Category { get; set; } = default!;
    public string Unit { get; set; } = default!;
    public int HierarchyLevel { get; set; }
    public string HierarchyPath { get; set; } = default!;
    public decimal MinStockLevel { get; set; }
    public decimal? MaxStockLevel { get; set; }
    public decimal? CriticalStockLevel { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsVariantBased { get; set; }
    public bool SerialTrackingEnabled { get; set; }
    public bool BarcodeRequired { get; set; }
    public int VariantCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
