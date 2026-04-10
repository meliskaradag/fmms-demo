namespace FMMS.Application.DTOs;

public class StockCardTreeNodeDto
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public string NodeType { get; set; } = "STOCK_CARD";
    public string StockNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Barcode { get; set; }
    public string? Sku { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock { get; set; }
    public int HierarchyLevel { get; set; }
    public string HierarchyPath { get; set; } = default!;
    public List<StockCardTreeNodeDto> Children { get; set; } = new();
}
