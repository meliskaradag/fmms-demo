using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockMovements;

public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, PagedResult<StockMovementDto>>
{
    private readonly IRepository<StockMovement> _movementRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockVariant> _variantRepository;

    public GetStockMovementsQueryHandler(
        IRepository<StockMovement> movementRepository,
        IRepository<StockCard> stockCardRepository,
        IRepository<StockVariant> variantRepository)
    {
        _movementRepository = movementRepository;
        _stockCardRepository = stockCardRepository;
        _variantRepository = variantRepository;
    }

    public async Task<PagedResult<StockMovementDto>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        var allMovements = await _movementRepository.GetAllAsync(cancellationToken);
        var allCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var allVariants = await _variantRepository.GetAllAsync(cancellationToken);
        var cardLookup = allCards.ToDictionary(c => c.Id, c => c.Name);
        var variantLookup = allVariants.ToDictionary(v => v.Id, v => v.Name);

        IEnumerable<StockMovement> filtered = allMovements;

        if (request.StockCardId.HasValue)
        {
            filtered = filtered.Where(m => m.StockCardId == request.StockCardId.Value);
        }

        var ordered = filtered.OrderByDescending(m => m.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new StockMovementDto
            {
                Id = m.Id,
                StockCardId = m.StockCardId,
                StockVariantId = m.StockVariantId,
                StockCardName = cardLookup.GetValueOrDefault(m.StockCardId, string.Empty),
                StockVariantName = m.StockVariantId.HasValue ? variantLookup.GetValueOrDefault(m.StockVariantId.Value, string.Empty) : null,
                MovementType = m.MovementType,
                Quantity = m.Quantity,
                Unit = m.Unit,
                UnitCost = m.UnitCost,
                TotalCost = m.TotalCost,
                WarehouseId = m.WarehouseId,
                LocationId = m.LocationId,
                FromLocationId = m.FromLocationId,
                ToLocationId = m.ToLocationId,
                Notes = m.Notes,
                PerformedAt = m.PerformedAt,
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy
            }).ToList();

        return new PagedResult<StockMovementDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
