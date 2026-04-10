using System.Text.Json;
using FMMS.Application.Common;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;

namespace FMMS.Application.Features.Assets.Services;

public class AssetLifecycleService
{
    private readonly IRepository<AssetHistory> _historyRepository;
    private readonly IRepository<AssetMovement> _movementRepository;
    private readonly IRepository<Asset> _assetRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly ITenantContext _tenantContext;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public AssetLifecycleService(
        IRepository<AssetHistory> historyRepository,
        IRepository<AssetMovement> movementRepository,
        IRepository<Asset> assetRepository,
        ICurrentUserContext currentUserContext,
        ITenantContext tenantContext)
    {
        _historyRepository = historyRepository;
        _movementRepository = movementRepository;
        _assetRepository = assetRepository;
        _currentUserContext = currentUserContext;
        _tenantContext = tenantContext;
    }

    public async Task EnsureParentRelationIsValidAsync(Guid assetId, Guid? parentAssetId, CancellationToken cancellationToken)
    {
        if (!parentAssetId.HasValue)
        {
            return;
        }

        if (assetId != Guid.Empty && assetId == parentAssetId.Value)
        {
            throw new InvalidOperationException("Asset cannot be parent of itself.");
        }

        var visited = new HashSet<Guid>();
        var currentParentId = parentAssetId;

        while (currentParentId.HasValue)
        {
            if (!visited.Add(currentParentId.Value))
            {
                throw new InvalidOperationException("Circular parent relation detected.");
            }

            if (assetId != Guid.Empty && currentParentId.Value == assetId)
            {
                throw new InvalidOperationException("Circular parent relation detected.");
            }

            var parent = await _assetRepository.GetByIdAsync(currentParentId.Value, cancellationToken)
                ?? throw new KeyNotFoundException($"Parent asset {currentParentId.Value} not found.");

            if (parent.TenantId != _tenantContext.TenantId)
            {
                throw new InvalidOperationException("Parent asset does not belong to current tenant.");
            }

            currentParentId = parent.ParentAssetId;
        }
    }

    public async Task AddHistoryAsync(
        Asset asset,
        AssetHistoryActionType actionType,
        object? oldValue,
        object? newValue,
        string? referenceType = null,
        Guid? referenceId = null,
        string? note = null,
        CancellationToken cancellationToken = default)
    {
        var history = new AssetHistory
        {
            TenantId = asset.TenantId,
            AssetId = asset.Id,
            ActionType = actionType,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue, JsonOptions),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue, JsonOptions),
            PerformedBy = _currentUserContext.UserId == Guid.Empty ? null : _currentUserContext.UserId,
            PerformedAt = DateTime.UtcNow,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            Note = note
        };

        await _historyRepository.AddAsync(history, cancellationToken);
    }

    public async Task AddMovementAsync(
        Asset asset,
        AssetMovementType movementType,
        Guid? fromLocationId,
        Guid? toLocationId,
        Guid? fromUserId,
        Guid? toUserId,
        string? reason,
        string? notes,
        CancellationToken cancellationToken = default)
    {
        var movement = new AssetMovement
        {
            TenantId = asset.TenantId,
            AssetId = asset.Id,
            MovementType = movementType,
            FromLocationId = fromLocationId,
            ToLocationId = toLocationId,
            FromUserId = fromUserId,
            ToUserId = toUserId,
            Reason = reason,
            Notes = notes,
            MovedBy = _currentUserContext.UserId == Guid.Empty ? null : _currentUserContext.UserId,
            MovedAt = DateTime.UtcNow
        };

        await _movementRepository.AddAsync(movement, cancellationToken);
    }

    public WarrantyState GetWarrantyState(DateTime? warrantyEndDate)
    {
        if (!warrantyEndDate.HasValue)
        {
            return WarrantyState.Active;
        }

        var now = DateTime.UtcNow.Date;
        if (warrantyEndDate.Value.Date < now)
        {
            return WarrantyState.Expired;
        }

        if (warrantyEndDate.Value.Date <= now.AddDays(AssetLifecycleConstants.WarrantyExpiringSoonDays))
        {
            return WarrantyState.ExpiringSoon;
        }

        return WarrantyState.Active;
    }
}
