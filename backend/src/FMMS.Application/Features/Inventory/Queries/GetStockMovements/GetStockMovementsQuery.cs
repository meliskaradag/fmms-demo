using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockMovements;

public record GetStockMovementsQuery(
    Guid? StockCardId,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<StockMovementDto>>;
