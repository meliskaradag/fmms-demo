namespace FMMS.Application.DTOs;

public class MaintenanceCardMaterialDto
{
    public Guid Id { get; set; }
    public Guid StockCardId { get; set; }
    public string StockCardName { get; set; } = default!;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = default!;
}
