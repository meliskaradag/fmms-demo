using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCards;

public class GetStockCardsQueryHandler : IRequestHandler<GetStockCardsQuery, PagedResult<StockCardDto>>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockBalance> _balanceRepository;
    private readonly IRepository<StockVariant> _variantRepository;

    public GetStockCardsQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockBalance> balanceRepository,
        IRepository<StockVariant> variantRepository)
    {
        _stockCardRepository = stockCardRepository;
        _balanceRepository = balanceRepository;
        _variantRepository = variantRepository;
    }

    public async Task<PagedResult<StockCardDto>> Handle(GetStockCardsQuery request, CancellationToken cancellationToken)
    {
        var allCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        var allVariants = await _variantRepository.GetAllAsync(cancellationToken);

        var balanceLookup = allBalances
            .GroupBy(b => b.StockCardId)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand));

        var variantCountLookup = allVariants
            .Where(v => v.IsActive)
            .GroupBy(v => v.StockCardId)
            .ToDictionary(g => g.Key, g => g.Count());

        IEnumerable<StockCard> filtered = allCards.Where(c => c.IsActive);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            filtered = filtered.Where(c =>
                c.Name.ToLowerInvariant().Contains(search) ||
                c.StockNumber.ToLowerInvariant().Contains(search));
        }

        var ordered = filtered.OrderByDescending(c => c.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new StockCardDto
            {
                Id = c.Id,
                ParentId = c.ParentId,
                NodeType = c.NodeType.ToString().ToUpperInvariant(),
                StockNumber = c.StockNumber,
                Name = c.Name,
                Barcode = c.Barcode,
                Sku = c.Sku,
                Category = c.Category,
                Unit = c.Unit,
                HierarchyLevel = c.HierarchyLevel,
                HierarchyPath = c.HierarchyPath,
                MinStockLevel = c.MinStockLevel,
                MaxStockLevel = c.MaxStockLevel,
                CriticalStockLevel = c.CriticalStockLevel,
                CurrentBalance = balanceLookup.GetValueOrDefault(c.Id, 0),
                IsVariantBased = c.IsVariantBased,
                SerialTrackingEnabled = c.SerialTrackingEnabled,
                BarcodeRequired = c.BarcodeRequired,
                VariantCount = variantCountLookup.GetValueOrDefault(c.Id, 0),
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();

        return new PagedResult<StockCardDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
