using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid StockCardId { get; set; }
    public Guid? StockVariantId { get; set; }
    public string StockCardName { get; set; } = default!;
    public string? StockVariantName { get; set; }
    public MovementType MovementType { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = default!;
    public decimal? UnitCost { get; set; }
    public decimal? TotalCost { get; set; }
    public Guid? WarehouseId { get; set; }
    public Guid? LocationId { get; set; }
    public Guid? FromLocationId { get; set; }
    public Guid? ToLocationId { get; set; }
    public string? Notes { get; set; }
    public DateTime PerformedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
}
