using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCard;

public record GetStockCardQuery(Guid Id) : IRequest<StockCardDto?>;
