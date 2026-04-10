using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.TransferAsset;

public class TransferAssetCommandHandler : IRequestHandler<TransferAssetCommand>
{
    private readonly IRepository<Asset> _assetRepository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public TransferAssetCommandHandler(
        IRepository<Asset> assetRepository,
        IRepository<Location> locationRepository,
        IUnitOfWork unitOfWork,
        AssetLifecycleService lifecycleService,
        ITenantContext tenantContext)
    {
        _assetRepository = assetRepository;
        _locationRepository = locationRepository;
        _unitOfWork = unitOfWork;
        _lifecycleService = lifecycleService;
        _tenantContext = tenantContext;
    }

    public async Task Handle(TransferAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.AssetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Asset {request.AssetId} not found.");

        if (asset.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Asset does not belong to current tenant.");
        }

        var toLocation = await _locationRepository.GetByIdAsync(request.ToLocationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Location {request.ToLocationId} not found.");

        if (toLocation.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Location does not belong to current tenant.");
        }

        if (asset.Status == AssetStatus.Disposed)
        {
            throw new InvalidOperationException("Disposed asset cannot be transferred.");
        }

        if (asset.LocationId == request.ToLocationId)
        {
            throw new InvalidOperationException("Asset cannot be transferred to same location.");
        }

        var fromLocationId = asset.LocationId;
        asset.LocationId = request.ToLocationId;
        _assetRepository.Update(asset);

        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.LocationChanged,
            oldValue: new { LocationId = fromLocationId },
            newValue: new { LocationId = request.ToLocationId },
            referenceType: "transfer",
            referenceId: asset.Id,
            note: request.Notes,
            cancellationToken: cancellationToken);

        await _lifecycleService.AddMovementAsync(
            asset,
            AssetMovementType.LocationTransfer,
            fromLocationId: fromLocationId,
            toLocationId: request.ToLocationId,
            fromUserId: asset.AssignedToUserId,
            toUserId: asset.AssignedToUserId,
            reason: request.Reason,
            notes: request.Notes,
            cancellationToken: cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
