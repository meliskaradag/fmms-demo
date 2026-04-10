using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAsset;

public record GetAssetQuery(Guid Id) : IRequest<AssetDto?>;
