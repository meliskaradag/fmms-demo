using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Queries.GetFaultReports;

public class GetFaultReportsQueryHandler : IRequestHandler<GetFaultReportsQuery, PagedResult<FaultReportDto>>
{
    private readonly IRepository<FaultReport> _repo;
    private readonly IRepository<FaultReportPhoto> _photoRepo;
    private readonly IRepository<Location> _locationRepo;
    private readonly IRepository<Asset> _assetRepo;

    public GetFaultReportsQueryHandler(
        IRepository<FaultReport> repo,
        IRepository<FaultReportPhoto> photoRepo,
        IRepository<Location> locationRepo,
        IRepository<Asset> assetRepo)
    {
        _repo = repo;
        _photoRepo = photoRepo;
        _locationRepo = locationRepo;
        _assetRepo = assetRepo;
    }

    public async Task<PagedResult<FaultReportDto>> Handle(GetFaultReportsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        var photos = await _photoRepo.GetAllAsync(cancellationToken);
        var locations = await _locationRepo.GetAllAsync(cancellationToken);
        var assets = await _assetRepo.GetAllAsync(cancellationToken);

        var locationLookup = locations.ToDictionary(l => l.Id, l => l.Name);
        var assetLookup = assets.ToDictionary(a => a.Id, a => a.Name);
        var photosByReport = photos.GroupBy(p => p.FaultReportId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var query = all.AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(f => f.Status == request.Status.Value);

        if (request.ReportedBy.HasValue)
            query = query.Where(f => f.ReportedBy == request.ReportedBy.Value);

        var total = query.Count();

        var items = query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FaultReportDto
            {
                Id = f.Id,
                Title = f.Title,
                Description = f.Description,
                LocationId = f.LocationId,
                LocationName = locationLookup.GetValueOrDefault(f.LocationId),
                AssetId = f.AssetId,
                AssetName = f.AssetId.HasValue ? assetLookup.GetValueOrDefault(f.AssetId.Value) : null,
                Priority = f.Priority,
                Status = f.Status,
                ReportedBy = f.ReportedBy,
                ReviewedBy = f.ReviewedBy,
                ReviewNote = f.ReviewNote,
                LinkedWorkOrderId = f.LinkedWorkOrderId,
                Photos = photosByReport.ContainsKey(f.Id)
                    ? photosByReport[f.Id].Select(p => new FaultReportPhotoDto
                    {
                        Id = p.Id,
                        FileName = p.FileName,
                        ContentType = p.ContentType,
                        Base64Data = p.Base64Data,
                        GpsLat = p.GpsLat,
                        GpsLng = p.GpsLng,
                        CreatedAt = p.CreatedAt
                    }).ToList()
                    : new List<FaultReportPhotoDto>(),
                CreatedAt = f.CreatedAt
            })
            .ToList();

        return new PagedResult<FaultReportDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
