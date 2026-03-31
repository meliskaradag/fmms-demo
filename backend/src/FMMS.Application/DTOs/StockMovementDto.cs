using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid StockCardId { get; set; }
    public string StockCardName { get; set; } = default!;
    public MovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public Guid? FromLocationId { get; set; }
    public Guid? ToLocationId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
}
