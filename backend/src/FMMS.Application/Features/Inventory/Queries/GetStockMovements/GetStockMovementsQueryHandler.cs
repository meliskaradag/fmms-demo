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

    public GetStockMovementsQueryHandler(
        IRepository<StockMovement> movementRepository,
        IRepository<StockCard> stockCardRepository)
    {
        _movementRepository = movementRepository;
        _stockCardRepository = stockCardRepository;
    }

    public async Task<PagedResult<StockMovementDto>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        var allMovements = await _movementRepository.GetAllAsync(cancellationToken);
        var allCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var cardLookup = allCards.ToDictionary(c => c.Id, c => c.Name);

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
                StockCardName = cardLookup.GetValueOrDefault(m.StockCardId, string.Empty),
                MovementType = m.MovementType,
                Quantity = m.Quantity,
                FromLocationId = m.FromLocationId,
                ToLocationId = m.ToLocationId,
                Notes = m.Notes,
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
