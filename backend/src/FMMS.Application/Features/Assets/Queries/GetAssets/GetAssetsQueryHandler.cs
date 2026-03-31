using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Queries.GetAssets;

public class GetAssetsQueryHandler : IRequestHandler<GetAssetsQuery, PagedResult<AssetDto>>
{
    private readonly IRepository<Asset> _repository;
    private readonly IRepository<Location> _locationRepository;

    public GetAssetsQueryHandler(
        IRepository<Asset> repository,
        IRepository<Location> locationRepository)
    {
        _repository = repository;
        _locationRepository = locationRepository;
    }

    public async Task<PagedResult<AssetDto>> Handle(GetAssetsQuery request, CancellationToken cancellationToken)
    {
        var allAssets = await _repository.GetAllAsync(cancellationToken);
        var allLocations = await _locationRepository.GetAllAsync(cancellationToken);
        var locationLookup = allLocations.ToDictionary(l => l.Id, l => l.Name);

        IEnumerable<Asset> filtered = allAssets;

        if (request.LocationId.HasValue)
        {
            filtered = filtered.Where(a => a.LocationId == request.LocationId.Value);
        }

        var ordered = filtered.OrderByDescending(a => a.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AssetDto
            {
                Id = a.Id,
                AssetNumber = a.AssetNumber,
                Name = a.Name,
                Category = a.Category,
                Manufacturer = a.Manufacturer,
                Model = a.Model,
                SerialNumber = a.SerialNumber,
                Status = a.Status,
                LocationId = a.LocationId,
                LocationName = locationLookup.GetValueOrDefault(a.LocationId, string.Empty),
                InstallationDate = a.InstallationDate,
                CreatedAt = a.CreatedAt
            }).ToList();

        return new PagedResult<AssetDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
