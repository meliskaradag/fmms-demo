using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Inventory.Queries.GetStockVariants;

public record GetStockVariantsQuery(Guid StockCardId) : IRequest<List<StockVariantDto>>;
