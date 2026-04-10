using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.UpdateAssetStatus;

public class UpdateAssetStatusCommandHandler : IRequestHandler<UpdateAssetStatusCommand>
{
    private readonly IRepository<Asset> _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public UpdateAssetStatusCommandHandler(
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

    public async Task Handle(UpdateAssetStatusCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (asset.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Asset does not belong to current tenant.");
        }

        if (asset.Status == AssetStatus.Disposed && request.Status != AssetStatus.Disposed)
        {
            throw new InvalidOperationException("Disposed asset status cannot be changed.");
        }

        if (request.Status == AssetStatus.Disposed && asset.AssignedToUserId.HasValue)
        {
            throw new InvalidOperationException("Assigned asset cannot be disposed. Unassign first.");
        }

        if (asset.Status == request.Status)
        {
            return;
        }

        var oldStatus = asset.Status;
        asset.Status = request.Status;
        _assetRepository.Update(asset);

        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.StatusChanged,
            oldValue: new { Status = oldStatus },
            newValue: new { Status = request.Status },
            referenceType: "asset_status",
            referenceId: asset.Id,
            note: request.Note ?? "Asset status updated",
            cancellationToken: cancellationToken);

        await _lifecycleService.AddMovementAsync(
            asset,
            AssetMovementType.StatusChange,
            fromLocationId: asset.LocationId,
            toLocationId: asset.LocationId,
            fromUserId: asset.AssignedToUserId,
            toUserId: asset.AssignedToUserId,
            reason: "status_change",
            notes: request.Note,
            cancellationToken: cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
