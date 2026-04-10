using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockVariants;

public class GetStockVariantsQueryHandler : IRequestHandler<GetStockVariantsQuery, List<StockVariantDto>>
{
    private readonly IRepository<StockVariant> _variantRepository;
    private readonly IRepository<StockBalance> _balanceRepository;

    public GetStockVariantsQueryHandler(
        IRepository<StockVariant> variantRepository,
        IRepository<StockBalance> balanceRepository)
    {
        _variantRepository = variantRepository;
        _balanceRepository = balanceRepository;
    }

    public async Task<List<StockVariantDto>> Handle(GetStockVariantsQuery request, CancellationToken cancellationToken)
    {
        var variants = await _variantRepository.GetAllAsync(cancellationToken);
        var balances = await _balanceRepository.GetAllAsync(cancellationToken);
        var balanceLookup = balances
            .Where(x => x.StockVariantId.HasValue)
            .GroupBy(x => x.StockVariantId!.Value)
            .ToDictionary(x => x.Key, x => x.Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand));

        return variants
            .Where(x => x.StockCardId == request.StockCardId && x.IsActive)
            .OrderBy(x => x.Code)
            .Select(x => new StockVariantDto
            {
                Id = x.Id,
                StockCardId = x.StockCardId,
                Code = x.Code,
                Sku = x.Sku,
                Barcode = x.Barcode,
                Name = x.Name,
                VariantSummary = x.VariantSummary,
                PriceAdjustment = x.PriceAdjustment,
                PurchasePriceOverride = x.PurchasePriceOverride,
                SalesPriceOverride = x.SalesPriceOverride,
                CurrentBalance = balanceLookup.GetValueOrDefault(x.Id, 0),
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToList();
    }
}
