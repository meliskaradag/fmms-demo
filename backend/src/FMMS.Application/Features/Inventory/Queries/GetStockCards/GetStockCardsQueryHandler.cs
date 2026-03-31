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

    public GetStockCardsQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockBalance> balanceRepository)
    {
        _stockCardRepository = stockCardRepository;
        _balanceRepository = balanceRepository;
    }

    public async Task<PagedResult<StockCardDto>> Handle(GetStockCardsQuery request, CancellationToken cancellationToken)
    {
        var allCards = await _stockCardRepository.GetAllAsync(cancellationToken);
        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);

        var balanceLookup = allBalances
            .GroupBy(b => b.StockCardId)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.CurrentStock));

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
                StockNumber = c.StockNumber,
                Name = c.Name,
                Unit = c.Unit,
                MinStockLevel = c.MinStockLevel,
                CurrentBalance = balanceLookup.GetValueOrDefault(c.Id, 0),
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
