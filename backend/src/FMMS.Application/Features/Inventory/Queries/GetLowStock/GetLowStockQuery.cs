using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetLowStock;

public record GetLowStockQuery() : IRequest<List<StockCardDto>>;
