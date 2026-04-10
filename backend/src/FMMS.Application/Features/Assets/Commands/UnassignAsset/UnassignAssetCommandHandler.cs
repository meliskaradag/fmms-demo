using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.UnassignAsset;

public class UnassignAssetCommandHandler : IRequestHandler<UnassignAssetCommand>
{
    private readonly IRepository<Asset> _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public UnassignAssetCommandHandler(
        IRepository<Asset> assetRepository,
        IUnitOfWork unitOfWork,
        AssetLifecycleService lifecycleService,
        ITenantContext tenantContext)
    {
        _assetRepository = assetRepository;
        _unitOfWork = unitOfWork;
        _lifecycleService = lifecycleService;
        _tenantContext = tenantContext;
    }

    public async Task Handle(UnassignAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (asset.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Asset does not belong to current tenant.");
        }

        if (!asset.AssignedToUserId.HasValue)
        {
            throw new InvalidOperationException("Asset is already unassigned.");
        }

        var previousUserId = asset.AssignedToUserId;
        var previousStatus = asset.Status;
        asset.AssignedToUserId = null;
        if (asset.Status == AssetStatus.Assigned)
        {
            asset.Status = AssetStatus.Active;
        }

        _assetRepository.Update(asset);

        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.Unassigned,
            oldValue: new { AssignedToUserId = previousUserId, Status = previousStatus },
            newValue: new { AssignedToUserId = (Guid?)null, Status = asset.Status },
            referenceType: "assignment",
            referenceId: asset.Id,
            note: request.Notes,
            cancellationToken: cancellationToken);

        await _lifecycleService.AddMovementAsync(
            asset,
            AssetMovementType.Return,
            fromLocationId: asset.LocationId,
            toLocationId: asset.LocationId,
            fromUserId: previousUserId,
            toUserId: null,
            reason: request.Reason,
            notes: request.Notes,
            cancellationToken: cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
