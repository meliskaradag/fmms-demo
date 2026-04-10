using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FMMS.Application.Features.Assets.Queries.GetAssets;

public class GetAssetsQueryHandler : IRequestHandler<GetAssetsQuery, PagedResult<AssetDto>>
{
    private readonly IRepository<Asset> _repository;
    private readonly AssetLifecycleService _lifecycleService;

    public GetAssetsQueryHandler(
        IRepository<Asset> repository,
        AssetLifecycleService lifecycleService)
    {
        _repository = repository;
        _lifecycleService = lifecycleService;
    }

    public async Task<PagedResult<AssetDto>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        var filtered = _repository.GetQueryable().AsNoTracking();

        if (request.LocationId.HasValue)
        {
            filtered = filtered.Where(x => x.LocationId == request.LocationId.Value);
        }

        if (request.Status.HasValue)
        {
            filtered = filtered.Where(x => x.Status == request.Status.Value);
        }

        if (request.Condition.HasValue)
        {
            filtered = filtered.Where(x => x.Condition == request.Condition.Value);
        }

        if (request.Assigned.HasValue)
        {
            filtered = request.Assigned.Value
                ? filtered.Where(x => x.AssignedToUserId != null)
                : filtered.Where(x => x.AssignedToUserId == null);
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim().ToLower();
            filtered = filtered.Where(x =>
                x.AssetTag.ToLower().Contains(keyword) ||
                x.AssetNumber.ToLower().Contains(keyword) ||
                x.Name.ToLower().Contains(keyword) ||
                x.Model.ToLower().Contains(keyword) ||
                x.Manufacturer.ToLower().Contains(keyword) ||
                (x.Brand != null && x.Brand.ToLower().Contains(keyword)) ||
                (x.Description != null && x.Description.ToLower().Contains(keyword)));
        }

        if (!string.IsNullOrWhiteSpace(request.SerialNumber))
        {
            var serial = request.SerialNumber.Trim().ToLower();
            filtered = filtered.Where(x => x.SerialNumber != null && x.SerialNumber.ToLower().Contains(serial));
        }

        if (request.WarrantyState.HasValue)
        {
            var today = DateTime.UtcNow.Date;
            var threshold = today.AddDays(AssetLifecycleConstants.WarrantyExpiringSoonDays);
            filtered = request.WarrantyState.Value switch
            {
                WarrantyState.Expired => filtered.Where(x => x.WarrantyEndDate.HasValue && x.WarrantyEndDate.Value.Date < today),
                WarrantyState.ExpiringSoon => filtered.Where(x => x.WarrantyEndDate.HasValue && x.WarrantyEndDate.Value.Date >= today && x.WarrantyEndDate.Value.Date <= threshold),
                _ => filtered.Where(x => !x.WarrantyEndDate.HasValue || x.WarrantyEndDate.Value.Date > threshold)
            };
        }

        var total = await filtered.CountAsync(cancellationToken);

        var items = await filtered
            .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
            }).ToListAsync(cancellationToken);

        foreach (var item in items)
        {
            item.WarrantyState = _lifecycleService.GetWarrantyState(item.WarrantyEndDate);
        }

        return new PagedResult<AssetDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
