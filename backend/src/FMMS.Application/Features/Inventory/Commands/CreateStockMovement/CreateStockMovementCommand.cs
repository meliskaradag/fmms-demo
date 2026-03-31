using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockMovement;

public record CreateStockMovementCommand(
    Guid StockCardId,
    MovementType MovementType,
    decimal Quantity,
    Guid? FromLocationId,
    Guid? ToLocationId,
    string? Notes
) : IRequest<Guid>;
