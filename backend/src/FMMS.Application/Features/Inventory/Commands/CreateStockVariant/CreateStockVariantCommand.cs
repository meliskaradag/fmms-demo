using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.CreateStockVariant;

public record CreateStockVariantCommand(
    Guid StockCardId,
    string Code,
    string? Sku,
    string? Barcode,
    string? Name,
    decimal PriceAdjustment,
    decimal? PurchasePriceOverride,
    decimal? SalesPriceOverride,
    List<VariantAttributeSelection> Attributes
) : IRequest<Guid>;

public record VariantAttributeSelection(Guid StockAttributeId, Guid StockAttributeOptionId);
