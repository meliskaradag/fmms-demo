using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAssets;

public record GetAssetsQuery(
    Guid? LocationId,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<AssetDto>>;
