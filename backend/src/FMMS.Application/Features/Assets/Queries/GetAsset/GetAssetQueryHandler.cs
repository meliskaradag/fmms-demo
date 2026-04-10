using FMMS.Application.DTOs;
using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Queries.GetAsset;

public class GetAssetQueryHandler : IRequestHandler<GetAssetQuery, AssetDto?>
{
    private readonly IRepository<FMMS.Domain.Entities.Asset> _assetRepository;
    private readonly AssetLifecycleService _lifecycleService;

    public GetAssetQueryHandler(
        IRepository<FMMS.Domain.Entities.Asset> assetRepository,
        AssetLifecycleService lifecycleService)
    {
        _assetRepository = assetRepository;
        _lifecycleService = lifecycleService;
    }

    public async Task<AssetDto?> Handle(GetAssetQuery request, CancellationToken cancellationToken)
    {
        var item = await _assetRepository.GetQueryable()
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                AssetTag = a.AssetTag,
                ItemId = a.ItemId,
                AssetNumber = a.AssetNumber,
                Name = a.Name,
                Category = a.Category,
                Condition = a.Condition,
                DepartmentId = a.DepartmentId,
                AssignedToUserId = a.AssignedToUserId,
                Manufacturer = a.Manufacturer,
                Brand = a.Brand,
                Model = a.Model,
                SerialNumber = a.SerialNumber,
                Specifications = a.Specifications,
                Status = a.Status,
                ParentAssetId = a.ParentAssetId,
                LocationId = a.LocationId,
                LocationName = a.Location.Name,
                InstallationDate = a.InstallationDate,
                PurchaseDate = a.PurchaseDate,
                PurchaseCost = a.PurchaseCost,
                SupplierId = a.SupplierId,
                WarrantyStartDate = a.WarrantyStartDate,
                WarrantyEndDate = a.WarrantyEndDate,
                Description = a.Description,
                Notes = a.Notes,
                Barcode = a.Barcode,
                QrCode = a.QrCode,
                UpdatedAt = a.UpdatedAt,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (item is not null)
        {
            item.WarrantyState = _lifecycleService.GetWarrantyState(item.WarrantyEndDate);
        }

        return item;
    }
}
