using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockMovement;

public record CreateStockMovementCommand(
    Guid StockCardId,
    Guid? StockVariantId,
    MovementType MovementType,
    decimal Quantity,
    string? Unit = null,
    decimal? UnitCost = null,
    Guid? WarehouseId = null,
    Guid? LocationId = null,
    Guid? FromLocationId = null,
    Guid? ToLocationId = null,
    string? ReferenceType = null,
    Guid? ReferenceId = null,
    string? Notes = null
) : IRequest<Guid>;
