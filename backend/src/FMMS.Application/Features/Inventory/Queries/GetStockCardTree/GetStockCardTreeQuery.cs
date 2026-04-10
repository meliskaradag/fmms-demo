using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockCardTree;

public record GetStockCardTreeQuery() : IRequest<List<StockCardTreeNodeDto>>;
