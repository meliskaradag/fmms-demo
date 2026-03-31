namespace FMMS.Application.DTOs;

public class StockBalanceDto
{
    public Guid Id { get; set; }
    public Guid StockCardId { get; set; }
    public Guid LocationId { get; set; }
    public decimal Quantity { get; set; }
}
