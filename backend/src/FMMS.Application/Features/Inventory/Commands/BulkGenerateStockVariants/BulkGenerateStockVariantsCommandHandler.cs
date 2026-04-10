using FMMS.Application.Features.Inventory.Commands.CreateStockVariant;
using MediatR;

namespace FMMS.Application.Features.Inventory.Commands.BulkGenerateStockVariants;

public class BulkGenerateStockVariantsCommandHandler : IRequestHandler<BulkGenerateStockVariantsCommand, List<Guid>>
{
    private readonly IMediator _mediator;

    public BulkGenerateStockVariantsCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<List<Guid>> Handle(BulkGenerateStockVariantsCommand request, CancellationToken cancellationToken)
    {
        var createdIds = new List<Guid>();
        foreach (var variant in request.Variants)
        {
            var id = await _mediator.Send(new CreateStockVariantCommand(
                request.StockCardId,
                variant.Code,
                variant.Sku,
                variant.Barcode,
                variant.Name,
                variant.PriceAdjustment,
                variant.PurchasePriceOverride,
                variant.SalesPriceOverride,
                variant.Attributes
                    .Select(a => new VariantAttributeSelection(a.StockAttributeId, a.StockAttributeOptionId))
                    .ToList()
            ), cancellationToken);

            createdIds.Add(id);
        }

        return createdIds;
    }
}
