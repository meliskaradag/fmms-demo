using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCards;

public record GetStockCardsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<StockCardDto>>;
