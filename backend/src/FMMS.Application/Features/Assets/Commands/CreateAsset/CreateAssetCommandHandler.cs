using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using FMMS.Application.Features.Assets.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetCommandHandler : IRequestHandler<CreateAssetCommand, Guid>
{
    private readonly IRepository<Asset> _repository;
    private readonly IRepository<Location> _locationRepository;
    private readonly IRepository<StockCard> _stockCardRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AssetLifecycleService _lifecycleService;
    private readonly ITenantContext _tenantContext;

    public CreateAssetCommandHandler(
        IRepository<Asset> repository,
        IRepository<Location> locationRepository,
        IRepository<StockCard> stockCardRepository,
        IUnitOfWork unitOfWork,
        AssetLifecycleService lifecycleService,
        ITenantContext tenantContext)
    {
        _repository = repository;
        _locationRepository = locationRepository;
        _stockCardRepository = stockCardRepository;
        _unitOfWork = unitOfWork;
        _lifecycleService = lifecycleService;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
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

        await _lifecycleService.EnsureParentRelationIsValidAsync(Guid.Empty, request.ParentAssetId, cancellationToken);

        var assetTag = string.IsNullOrWhiteSpace(request.AssetTag) ? request.AssetNumber.Trim() : request.AssetTag.Trim();
        if (await _repository.GetQueryable().AnyAsync(x => x.AssetTag == assetTag, cancellationToken))
        {
            throw new InvalidOperationException("Asset tag must be unique.");
        }

        if (!string.IsNullOrWhiteSpace(request.SerialNumber))
        {
            var normalizedSerial = request.SerialNumber.Trim();
            var duplicateSerial = await _repository.GetQueryable()
                .AnyAsync(x => x.SerialNumber != null && x.SerialNumber == normalizedSerial, cancellationToken);
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

        var asset = new Asset
        {
            Name = request.Name,
            AssetTag = assetTag,
            AssetNumber = request.AssetNumber,
            ItemId = request.ItemId,
            Category = request.Category,
            LocationId = request.LocationId,
            DepartmentId = request.DepartmentId,
            AssignedToUserId = request.AssignedToUserId,
            ParentAssetId = request.ParentAssetId,
            Status = request.Status,
            Condition = request.Condition ?? AssetCondition.Good,
            Barcode = request.Barcode,
            QrCode = request.QrCode,
            NfcTagId = request.NfcTagId,
            InstallationDate = request.InstallationDate,
            BatchNumber = request.BatchNumber,
            Manufacturer = request.Manufacturer,
            Brand = request.Brand,
            Model = request.Model,
            SerialNumber = string.IsNullOrWhiteSpace(request.SerialNumber) ? null : request.SerialNumber.Trim(),
            Specifications = request.Specifications,
            StockCardId = request.StockCardId.Value,
            SupplierId = request.SupplierId,
            PurchaseDate = request.PurchaseDate,
            PurchaseCost = request.PurchaseCost,
            WarrantyStartDate = request.WarrantyStartDate,
            WarrantyEndDate = request.WarrantyEndDate,
            Description = request.Description,
            Notes = request.Notes,
            Metadata = request.Metadata,
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(asset, cancellationToken);
        await _lifecycleService.AddHistoryAsync(
            asset,
            AssetHistoryActionType.Created,
            oldValue: null,
            newValue: new
            {
                asset.AssetTag,
                asset.Name,
                asset.Status,
                asset.LocationId,
                asset.AssignedToUserId
            },
            referenceType: "asset",
            referenceId: asset.Id,
            note: "Asset created",
            cancellationToken: cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return asset.Id;
    }
}
