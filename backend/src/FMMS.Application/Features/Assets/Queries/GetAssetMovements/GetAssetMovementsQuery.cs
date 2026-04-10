using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAssetMovements;

public record GetAssetMovementsQuery(Guid AssetId) : IRequest<List<AssetMovementDto>>;
