using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Queries.GetAssetMovements;

public class GetAssetMovementsQueryHandler : IRequestHandler<GetAssetMovementsQuery, List<AssetMovementDto>>
{
    private readonly IRepository<AssetMovement> _movementRepository;

    public GetAssetMovementsQueryHandler(IRepository<AssetMovement> movementRepository)
    {
        _movementRepository = movementRepository;
    }

    public async Task<List<AssetMovementDto>> Handle(GetAssetMovementsQuery request, CancellationToken cancellationToken)
    {
        return await _movementRepository.GetQueryable()
            .AsNoTracking()
            .Where(x => x.AssetId == request.AssetId)
            .OrderByDescending(x => x.MovedAt)
            .Select(x => new AssetMovementDto
            {
                Id = x.Id,
                AssetId = x.AssetId,
                MovementType = x.MovementType,
                FromLocationId = x.FromLocationId,
                ToLocationId = x.ToLocationId,
                FromUserId = x.FromUserId,
                ToUserId = x.ToUserId,
                Reason = x.Reason,
                MovedBy = x.MovedBy,
                MovedAt = x.MovedAt,
                Notes = x.Notes
            })
            .ToListAsync(cancellationToken);
    }
}
