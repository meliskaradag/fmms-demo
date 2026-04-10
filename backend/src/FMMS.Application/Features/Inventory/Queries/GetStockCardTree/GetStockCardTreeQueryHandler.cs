using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCardTree;

public class GetStockCardTreeQueryHandler : IRequestHandler<GetStockCardTreeQuery, List<StockCardTreeNodeDto>>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockVariant> _variantRepository;
    private readonly IRepository<StockBalance> _balanceRepository;

    public GetStockCardTreeQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockVariant> variantRepository,
        IRepository<StockBalance> balanceRepository)
    {
        _stockCardRepository = stockCardRepository;
        _variantRepository = variantRepository;
        _balanceRepository = balanceRepository;
    }

    public async Task<List<StockCardTreeNodeDto>> Handle(GetStockCardTreeQuery request, CancellationToken cancellationToken)
    {
        var cards = (await _stockCardRepository.GetAllAsync(cancellationToken))
            .Where(x => x.IsActive)
            .OrderBy(x => x.HierarchyPath)
            .ToList();
        var variants = (await _variantRepository.GetAllAsync(cancellationToken))
            .Where(x => x.IsActive)
            .ToList();
        var balances = await _balanceRepository.GetAllAsync(cancellationToken);

        var balanceByCard = balances
            .GroupBy(x => x.StockCardId)
            .ToDictionary(x => x.Key, x => x.Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand));
        var balanceByVariant = balances
            .Where(x => x.StockVariantId.HasValue)
            .GroupBy(x => x.StockVariantId!.Value)
            .ToDictionary(x => x.Key, x => x.Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand));

        var nodeMap = cards.ToDictionary(
            card => card.Id,
            card => new StockCardTreeNodeDto
            {
                Id = card.Id,
                ParentId = card.ParentId,
                NodeType = card.NodeType.ToString().ToUpperInvariant(),
                StockNumber = card.StockNumber,
                Name = card.Name,
                Barcode = card.Barcode,
                Sku = card.Sku,
                IsActive = card.IsActive,
                IsLowStock = card.NodeType == StockNodeType.StockCard &&
                             balanceByCard.GetValueOrDefault(card.Id, 0) <= card.MinStockLevel,
                HierarchyLevel = card.HierarchyLevel,
                HierarchyPath = card.HierarchyPath
            });

        var roots = new List<StockCardTreeNodeDto>();
        foreach (var node in nodeMap.Values)
        {
            if (node.ParentId.HasValue && nodeMap.TryGetValue(node.ParentId.Value, out var parent))
            {
                parent.Children.Add(node);
            }
            else
            {
                roots.Add(node);
            }
        }

        foreach (var variant in variants)
        {
            if (!nodeMap.TryGetValue(variant.StockCardId, out var parentCard))
                continue;

            parentCard.Children.Add(new StockCardTreeNodeDto
            {
                Id = variant.Id,
                ParentId = variant.StockCardId,
                NodeType = "STOCK_VARIANT",
                StockNumber = variant.Code,
                Name = variant.Name,
                Barcode = variant.Barcode,
                Sku = variant.Sku,
                IsActive = variant.IsActive,
                IsLowStock = false,
                HierarchyLevel = parentCard.HierarchyLevel + 1,
                HierarchyPath = $"{parentCard.HierarchyPath} > {variant.Name}"
            });
        }

        return roots.OrderBy(x => x.HierarchyPath).ToList();
    }
}
