using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Commands.UpdateAsset;

public class UpdateAssetCommandHandler : IRequestHandler<UpdateAssetCommand>
{
    private readonly IRepository<Asset> _assetRepository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public UpdateAssetCommandHandler(
        IRepository<Asset> assetRepository,
        IRepository<Location> locationRepository,
        IRepository<StockCard> stockCardRepository,
        IUnitOfWork unitOfWork,
        AssetLifecycleService lifecycleService,
        ITenantContext tenantContext)
    {
        _assetRepository = assetRepository;
        _locationRepository = locationRepository;
        _stockCardRepository = stockCardRepository;
        _unitOfWork = unitOfWork;
        _lifecycleService = lifecycleService;
        _tenantContext = tenantContext;
    }

    public async Task Handle(UpdateAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = await _assetRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Asset {request.Id} not found.");

        if (asset.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Asset does not belong to current tenant.");
        }

        var location = await _locationRepository.GetByIdAsync(request.LocationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Location {request.LocationId} not found.");

        if (location.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Location does not belong to current tenant.");
        }

        if (!request.StockCardId.HasValue)
        {
            throw new InvalidOperationException("Stock card is required.");
        }

        var stockCard = await _stockCardRepository.GetByIdAsync(request.StockCardId.Value, cancellationToken)
            ?? throw new KeyNotFoundException($"Stock card {request.StockCardId.Value} not found.");

        if (stockCard.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Stock card does not belong to current tenant.");
        }

        await _lifecycleService.EnsureParentRelationIsValidAsync(asset.Id, request.ParentAssetId, cancellationToken);

        var assetTag = string.IsNullOrWhiteSpace(request.AssetTag) ? request.AssetNumber.Trim() : request.AssetTag.Trim();
        var duplicateTag = await _assetRepository.GetQueryable()
            .AnyAsync(x => x.Id != asset.Id && x.AssetTag == assetTag, cancellationToken);
        if (duplicateTag)
        {
            throw new InvalidOperationException("Asset tag must be unique.");
        }

        if (!string.IsNullOrWhiteSpace(request.SerialNumber))
        {
            var serialNumber = request.SerialNumber.Trim();
            var duplicateSerial = await _assetRepository.GetQueryable()
                .AnyAsync(x => x.Id != asset.Id && x.SerialNumber != null && x.SerialNumber == serialNumber, cancellationToken);
            if (duplicateSerial)
            {
                throw new InvalidOperationException("Serial number is already used by another asset.");
            }
        }

        if (request.WarrantyStartDate.HasValue && request.WarrantyEndDate.HasValue &&
            request.WarrantyEndDate.Value <= request.WarrantyStartDate.Value)
        {
            throw new InvalidOperationException("Warranty end date must be greater than warranty start date.");
        }

        if (asset.Status == AssetStatus.Disposed && request.AssignedToUserId.HasValue)
        {
            throw new InvalidOperationException("Disposed asset cannot be assigned.");
        }

        if (asset.Status == AssetStatus.Disposed && asset.LocationId != request.LocationId)
        {
            throw new InvalidOperationException("Disposed asset cannot be transferred.");
        }

        if (asset.Status == AssetStatus.Assigned &&
            asset.AssignedToUserId.HasValue &&
            request.AssignedToUserId.HasValue &&
            asset.AssignedToUserId.Value != request.AssignedToUserId.Value)
        {
            throw new InvalidOperationException("Asset must be unassigned before assigning to another user.");
        }

        var before = new
        {
            asset.AssetTag,
            asset.AssetNumber,
            asset.Name,
            asset.Category,
            asset.Status,
            asset.Condition,
            asset.LocationId,
            asset.AssignedToUserId,
            asset.ParentAssetId,
            asset.WarrantyStartDate,
            asset.WarrantyEndDate
        };

        var previousLocationId = asset.LocationId;
        var previousAssignedToUserId = asset.AssignedToUserId;
        var previousStatus = asset.Status;

        asset.Name = request.Name;
        asset.AssetTag = assetTag;
        asset.AssetNumber = request.AssetNumber;
        asset.ItemId = request.ItemId;
        asset.Category = request.Category;
        asset.LocationId = request.LocationId;
        asset.DepartmentId = request.DepartmentId;
        asset.AssignedToUserId = request.AssignedToUserId;
        asset.ParentAssetId = request.ParentAssetId;
        asset.Status = request.Status;
        asset.Condition = request.Condition;
        asset.Barcode = request.Barcode;
        asset.QrCode = request.QrCode;
        asset.NfcTagId = request.NfcTagId;
        asset.InstallationDate = request.InstallationDate;
        asset.BatchNumber = request.BatchNumber;
        asset.Manufacturer = request.Manufacturer;
        asset.Brand = request.Brand;
        asset.Model = request.Model;
        asset.SerialNumber = string.IsNullOrWhiteSpace(request.SerialNumber) ? null : request.SerialNumber.Trim();
        asset.Specifications = request.Specifications;
        asset.StockCardId = request.StockCardId.Value;
        asset.SupplierId = request.SupplierId;
        asset.PurchaseDate = request.PurchaseDate;
        asset.PurchaseCost = request.PurchaseCost;
        asset.WarrantyStartDate = request.WarrantyStartDate;
        asset.WarrantyEndDate = request.WarrantyEndDate;
        asset.Description = request.Description;
        asset.Notes = request.Notes;
        asset.Metadata = request.Metadata;

        _assetRepository.Update(asset);

        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.Updated,
            oldValue: before,
            newValue: new
            {
                asset.AssetTag,
                asset.AssetNumber,
                asset.Name,
                asset.Category,
                asset.Status,
                asset.Condition,
                asset.LocationId,
                asset.AssignedToUserId,
                asset.ParentAssetId,
                asset.WarrantyStartDate,
                asset.WarrantyEndDate
            },
            referenceType: "asset",
            referenceId: asset.Id,
            note: "Asset updated",
            cancellationToken: cancellationToken);

        if (previousStatus != asset.Status)
        {
            await _lifecycleService.AddHistoryAsync(
                asset,
                AssetHistoryActionType.StatusChanged,
                oldValue: new { Status = previousStatus },
                newValue: new { Status = asset.Status },
                referenceType: "asset",
                referenceId: asset.Id,
                note: "Asset status changed",
                cancellationToken: cancellationToken);

            await _lifecycleService.AddMovementAsync(
                asset,
                AssetMovementType.StatusChange,
                fromLocationId: asset.LocationId,
                toLocationId: asset.LocationId,
                fromUserId: previousAssignedToUserId,
                toUserId: asset.AssignedToUserId,
                reason: "status_change",
                notes: $"{previousStatus} -> {asset.Status}",
                cancellationToken: cancellationToken);
        }

        if (previousLocationId != asset.LocationId)
        {
            await _lifecycleService.AddHistoryAsync(
                asset,
                AssetHistoryActionType.LocationChanged,
                oldValue: new { LocationId = previousLocationId },
                newValue: new { LocationId = asset.LocationId },
                referenceType: "asset",
                referenceId: asset.Id,
                note: "Asset location changed",
                cancellationToken: cancellationToken);

            await _lifecycleService.AddMovementAsync(
                asset,
                AssetMovementType.LocationTransfer,
                fromLocationId: previousLocationId,
                toLocationId: asset.LocationId,
                fromUserId: previousAssignedToUserId,
                toUserId: asset.AssignedToUserId,
                reason: "location_update",
                notes: "Asset location changed via update",
                cancellationToken: cancellationToken);
        }

        if (previousAssignedToUserId != asset.AssignedToUserId)
        {
            var assignedAction = asset.AssignedToUserId.HasValue ? AssetHistoryActionType.Assigned : AssetHistoryActionType.Unassigned;
            await _lifecycleService.AddHistoryAsync(
                asset,
                assignedAction,
                oldValue: new { AssignedToUserId = previousAssignedToUserId },
                newValue: new { AssignedToUserId = asset.AssignedToUserId },
                referenceType: "asset",
                referenceId: asset.Id,
                note: "Asset assignment changed",
                cancellationToken: cancellationToken);

            await _lifecycleService.AddMovementAsync(
                asset,
                asset.AssignedToUserId.HasValue ? AssetMovementType.Assignment : AssetMovementType.Return,
                fromLocationId: asset.LocationId,
                toLocationId: asset.LocationId,
                fromUserId: previousAssignedToUserId,
                toUserId: asset.AssignedToUserId,
                reason: "assignment_update",
                notes: "Assignment changed via update",
                cancellationToken: cancellationToken);
        }

        if (before.ParentAssetId != asset.ParentAssetId)
        {
            await _lifecycleService.AddHistoryAsync(
                asset,
                AssetHistoryActionType.ParentChanged,
                oldValue: new { before.ParentAssetId },
                newValue: new { asset.ParentAssetId },
                referenceType: "asset",
                referenceId: asset.Id,
                note: "Parent asset changed",
                cancellationToken: cancellationToken);
        }

        if (before.WarrantyStartDate != asset.WarrantyStartDate || before.WarrantyEndDate != asset.WarrantyEndDate)
        {
            await _lifecycleService.AddHistoryAsync(
                asset,
                AssetHistoryActionType.WarrantyUpdated,
                oldValue: new { before.WarrantyStartDate, before.WarrantyEndDate },
                newValue: new { asset.WarrantyStartDate, asset.WarrantyEndDate },
                referenceType: "asset",
                referenceId: asset.Id,
                note: "Warranty details updated",
                cancellationToken: cancellationToken);
        }

        if (asset.Status == AssetStatus.Broken && asset.AssignedToUserId.HasValue)
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
