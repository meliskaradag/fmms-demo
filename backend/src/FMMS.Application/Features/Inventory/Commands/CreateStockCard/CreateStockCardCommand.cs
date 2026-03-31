using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockCard;

public record CreateStockCardCommand(
    string StockNumber,
    string Name,
    string Category,
    string Unit,
    decimal MinStockLevel,
    decimal CurrentBalance
) : IRequest<Guid>;
