using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockCard;

public record CreateStockCardCommand(
    string StockNumber,
    string Name,
    string Category,
    string Unit,
    decimal MinStockLevel,
    decimal CurrentBalance,
    Guid? ParentId,
    StockNodeType? NodeType = null,
    string? Barcode = null,
    string? Sku = null,
    bool? IsVariantBased = null,
    bool? UsesVariants = null,
    bool IsActive = true,
    string? Description = null
) : IRequest<Guid>;
