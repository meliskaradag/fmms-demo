using FMMS.Domain.Enums;
using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAssets;

public record GetAssetsQuery(
    Guid? LocationId,
    Guid? StockCardId = null,
    int Page = 1,
    int PageSize = 20,
    AssetStatus? Status = null,
    AssetCondition? Condition = null,
    bool? Assigned = null,
    WarrantyState? WarrantyState = null,
    string? Keyword = null,
    string? SerialNumber = null
) : IRequest<PagedResult<AssetDto>>;
