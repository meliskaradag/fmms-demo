namespace FMMS.Application.DTOs;

public class StockCardDto
{
    public Guid Id { get; set; }
    public string StockNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Unit { get; set; } = default!;
    public decimal MinStockLevel { get; set; }
    public decimal CurrentBalance { get; set; }
    public DateTime CreatedAt { get; set; }
}
