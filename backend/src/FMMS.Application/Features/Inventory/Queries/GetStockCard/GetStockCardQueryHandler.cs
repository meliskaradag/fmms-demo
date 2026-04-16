using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCard;

public class GetStockCardQueryHandler : IRequestHandler<GetStockCardQuery, StockCardDto?>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockBalance> _balanceRepository;
    private readonly IRepository<StockVariant> _variantRepository;

    public GetStockCardQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockBalance> balanceRepository,
        IRepository<StockVariant> variantRepository)
    {
        _stockCardRepository = stockCardRepository;
        _balanceRepository = balanceRepository;
        _variantRepository = variantRepository;
    }

    public async Task<StockCardDto?> Handle(GetStockCardQuery request, CancellationToken cancellationToken)
    {
        var card = await _stockCardRepository.GetByIdAsync(request.Id, cancellationToken);
        if (card is null)
            return null;

        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        var totalBalance = allBalances
            .Where(b => b.StockCardId == card.Id)
            .Sum(b => b.QuantityOnHand == 0 ? b.CurrentStock : b.QuantityOnHand);
        var variantCount = (await _variantRepository.GetAllAsync(cancellationToken))
            .Count(v => v.StockCardId == card.Id && v.IsActive);

        return new StockCardDto
        {
            Id = card.Id,
            ParentId = card.ParentId,
            NodeType = card.NodeType.ToString().ToUpperInvariant(),
            StockNumber = card.StockNumber,
            Name = card.Name,
            Barcode = card.Barcode,
            Sku = card.Sku,
            Category = card.Category,
            Unit = card.Unit,
            HierarchyLevel = card.HierarchyLevel,
            HierarchyPath = card.HierarchyPath,
            MinStockLevel = card.MinStockLevel,
            MaxStockLevel = card.MaxStockLevel,
            CriticalStockLevel = card.CriticalStockLevel,
            CurrentBalance = totalBalance,
            IsVariantBased = card.IsVariantBased,
            SerialTrackingEnabled = card.SerialTrackingEnabled,
            BarcodeRequired = card.BarcodeRequired,
            VariantCount = variantCount,
            IsActive = card.IsActive,
            CreatedAt = card.CreatedAt
        };
    }
}
