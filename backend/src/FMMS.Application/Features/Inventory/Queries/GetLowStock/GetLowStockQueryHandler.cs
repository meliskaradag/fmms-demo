using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetLowStock;

public class GetLowStockQueryHandler : IRequestHandler<GetLowStockQuery, List<StockCardDto>>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockBalance> _balanceRepository;

    public GetLowStockQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockBalance> balanceRepository)
    {
        _stockCardRepository = stockCardRepository;
        _balanceRepository = balanceRepository;
    }

    public async Task<List<StockCardDto>> Handle(GetLowStockQuery request, CancellationToken cancellationToken)
    {
        var allCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);

        var balanceLookup = allBalances
            .GroupBy(b => b.StockCardId)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand));

        return allCards
            .Where(c => c.IsActive && c.NodeType == FMMS.Domain.Enums.StockNodeType.StockCard)
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
                VariantCount = 0,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            })
            .Where(dto => dto.CurrentBalance <= dto.MinStockLevel)
            .OrderBy(dto => dto.CurrentBalance)
            .ToList();
    }
}
