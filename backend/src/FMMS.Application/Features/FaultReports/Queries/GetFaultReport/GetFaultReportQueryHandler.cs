using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Queries.GetFaultReport;

public class GetFaultReportQueryHandler : IRequestHandler<GetFaultReportQuery, FaultReportDto?>
{
    private readonly IRepository<FaultReport> _repo;
    private readonly IRepository<FaultReportPhoto> _photoRepo;
    private readonly IRepository<Location> _locationRepo;
    private readonly IRepository<Asset> _assetRepo;

    public GetFaultReportQueryHandler(
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

    public async Task<FaultReportDto?> Handle(GetFaultReportQuery request, CancellationToken cancellationToken)
    {
        var faultReport = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (faultReport is null) return null;

        var allPhotos = await _photoRepo.GetAllAsync(cancellationToken);
        var photos = allPhotos.Where(p => p.FaultReportId == faultReport.Id).ToList();

        var locations = await _locationRepo.GetAllAsync(cancellationToken);
        var locationName = locations.FirstOrDefault(l => l.Id == faultReport.LocationId)?.Name;

        string? assetName = null;
        if (faultReport.AssetId.HasValue)
        {
            var assets = await _assetRepo.GetAllAsync(cancellationToken);
            assetName = assets.FirstOrDefault(a => a.Id == faultReport.AssetId.Value)?.Name;
        }

        return new FaultReportDto
        {
            Id = faultReport.Id,
            Title = faultReport.Title,
            Description = faultReport.Description,
            LocationId = faultReport.LocationId,
            LocationName = locationName,
            AssetId = faultReport.AssetId,
            AssetName = assetName,
            Priority = faultReport.Priority,
            Status = faultReport.Status,
            ReportedBy = faultReport.ReportedBy,
            ReviewedBy = faultReport.ReviewedBy,
            ReviewNote = faultReport.ReviewNote,
            LinkedWorkOrderId = faultReport.LinkedWorkOrderId,
            Photos = photos.Select(p => new FaultReportPhotoDto
            {
                Id = p.Id,
                FileName = p.FileName,
                ContentType = p.ContentType,
                Base64Data = p.Base64Data,
                GpsLat = p.GpsLat,
                GpsLng = p.GpsLng,
                CreatedAt = p.CreatedAt
            }).ToList(),
            CreatedAt = faultReport.CreatedAt
        };
    }
}
