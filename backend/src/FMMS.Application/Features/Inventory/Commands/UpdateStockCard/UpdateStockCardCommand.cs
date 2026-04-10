using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.UpdateStockCard;

public record UpdateStockCardCommand(
    Guid StockCardId,
    string StockNumber,
    string Name,
    string Category,
    string Unit,
    decimal MinStockLevel,
    string? Barcode = null,
    string? Sku = null,
    decimal? MaxStockLevel = null,
    decimal? CriticalStockLevel = null,
    bool? IsVariantBased = null,
    bool? IsActive = null,
    StockNodeType? NodeType = null,
    string? Description = null
) : IRequest<bool>;
