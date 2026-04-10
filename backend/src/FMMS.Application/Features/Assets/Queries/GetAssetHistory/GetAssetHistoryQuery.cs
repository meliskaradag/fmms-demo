using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAssetHistory;

public record GetAssetHistoryQuery(Guid AssetId) : IRequest<List<AssetHistoryDto>>;
