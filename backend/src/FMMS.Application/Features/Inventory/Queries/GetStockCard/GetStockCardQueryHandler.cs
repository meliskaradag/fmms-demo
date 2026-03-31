using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCard;

public class GetStockCardQueryHandler : IRequestHandler<GetStockCardQuery, StockCardDto?>
{
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IRepository<StockBalance> _balanceRepository;

    public GetStockCardQueryHandler(
        IRepository<StockCard> stockCardRepository,
        IRepository<StockBalance> balanceRepository)
    {
        _stockCardRepository = stockCardRepository;
        _balanceRepository = balanceRepository;
    }

    public async Task<StockCardDto?> Handle(GetStockCardQuery request, CancellationToken cancellationToken)
    {
        var card = await _stockCardRepository.GetByIdAsync(request.Id, cancellationToken);
        if (card is null)
            return null;

        var allBalances = await _balanceRepository.GetAllAsync(cancellationToken);
        var totalBalance = allBalances
            .Where(b => b.StockCardId == card.Id)
            .Sum(b => b.CurrentStock);

        return new StockCardDto
        {
            Id = card.Id,
            StockNumber = card.StockNumber,
            Name = card.Name,
            Unit = card.Unit,
            MinStockLevel = card.MinStockLevel,
            CurrentBalance = totalBalance,
            CreatedAt = card.CreatedAt
        };
    }
}
