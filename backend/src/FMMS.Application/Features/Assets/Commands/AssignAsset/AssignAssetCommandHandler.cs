using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.AssignAsset;

public class AssignAssetCommandHandler : IRequestHandler<AssignAssetCommand>
{
    private readonly IRepository<Asset> _assetRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public AssignAssetCommandHandler(
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

    public async Task Handle(AssignAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (asset.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Asset does not belong to current tenant.");
        }

        if (asset.Status == AssetStatus.Disposed)
        {
            throw new InvalidOperationException("Disposed asset cannot be assigned.");
        }

        if (asset.AssignedToUserId.HasValue)
        {
            throw new InvalidOperationException("Asset is already assigned. Unassign first.");
        }

        var previousStatus = asset.Status;
        asset.AssignedToUserId = request.ToUserId;
        asset.Status = AssetStatus.Assigned;
        _assetRepository.Update(asset);

        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.Assigned,
            oldValue: new { AssignedToUserId = (Guid?)null, Status = previousStatus },
            newValue: new { AssignedToUserId = request.ToUserId, Status = asset.Status },
            referenceType: "assignment",
            referenceId: asset.Id,
            note: request.Notes,
            cancellationToken: cancellationToken);

        await _lifecycleService.AddMovementAsync(
            asset,
            AssetMovementType.Assignment,
            fromLocationId: asset.LocationId,
            toLocationId: asset.LocationId,
            fromUserId: null,
            toUserId: request.ToUserId,
            reason: request.Reason,
            notes: request.Notes,
            cancellationToken: cancellationToken);

        if (asset.Status == AssetStatus.Broken || previousStatus == AssetStatus.Broken)
        {
            await _lifecycleService.AddHistoryAsync(
                asset,
                AssetHistoryActionType.NoteAdded,
                oldValue: null,
                newValue: new { Warning = "Broken asset assigned" },
                referenceType: "business_rule",
                referenceId: asset.Id,
                note: "Broken asset assigned to user",
                cancellationToken: cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
