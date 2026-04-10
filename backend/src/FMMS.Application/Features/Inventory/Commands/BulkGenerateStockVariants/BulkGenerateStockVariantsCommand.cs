using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.BulkGenerateStockVariants;

public record BulkGenerateStockVariantsCommand(
    Guid StockCardId,
    List<BulkVariantTemplate> Variants
) : IRequest<List<Guid>>;

public record BulkVariantTemplate(
    string Code,
    string? Sku,
    string? Barcode,
    string? Name,
    decimal PriceAdjustment,
    decimal? PurchasePriceOverride,
    decimal? SalesPriceOverride,
    List<AttributesSelection> Attributes
);

public record AttributesSelection(Guid StockAttributeId, Guid StockAttributeOptionId);
