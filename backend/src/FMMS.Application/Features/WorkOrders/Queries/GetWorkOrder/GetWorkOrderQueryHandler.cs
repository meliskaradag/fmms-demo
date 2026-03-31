using FMMS.Application.DTOs;
using FMMS.Application.Interfaces;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Queries.GetWorkOrder;

public class GetWorkOrderQueryHandler : IRequestHandler<GetWorkOrderQuery, WorkOrderDto?>
{
    private readonly IRepository<WorkOrder> _repo;
    private readonly IRepository<WorkOrderAssignee> _assigneeRepo;
    private readonly IRepository<WorkOrderPhoto> _photoRepo;
    private readonly IRepository<FileObject> _fileRepo;
    private readonly IRepository<Location> _locationRepo;
    private readonly IRepository<Asset> _assetRepo;
    private readonly IStorageService _storageService;

    public GetWorkOrderQueryHandler(
        IRepository<WorkOrder> repo,
        IRepository<WorkOrderAssignee> assigneeRepo,
        IRepository<WorkOrderPhoto> photoRepo,
        IRepository<FileObject> fileRepo,
        IRepository<Location> locationRepo,
        IRepository<Asset> assetRepo,
        IStorageService storageService)
    {
        _repo = repo;
        _assigneeRepo = assigneeRepo;
        _photoRepo = photoRepo;
        _fileRepo = fileRepo;
        _locationRepo = locationRepo;
        _assetRepo = assetRepo;
        _storageService = storageService;
    }

    public async Task<WorkOrderDto?> Handle(GetWorkOrderQuery request, CancellationToken cancellationToken)
    {
        var wo = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (wo is null) return null;

        var location = await _locationRepo.GetByIdAsync(wo.LocationId, cancellationToken);
        Asset? asset = wo.AssetId.HasValue ? await _assetRepo.GetByIdAsync(wo.AssetId.Value, cancellationToken) : null;

        var allAssignees = await _assigneeRepo.GetAllAsync(cancellationToken);
        var assignees = allAssignees.Where(a => a.WorkOrderId == wo.Id).ToList();

        var allPhotos = await _photoRepo.GetAllAsync(cancellationToken);
        var photos = allPhotos.Where(p => p.WorkOrderId == wo.Id).ToList();

        var photoDtos = new List<WorkOrderPhotoDto>();
        foreach (var photo in photos)
        {
            var file = await _fileRepo.GetByIdAsync(photo.FileObjectId, cancellationToken);
            string? downloadUrl = null;
            if (file is not null)
            {
                downloadUrl = await _storageService.GeneratePresignedDownloadUrl(file.Bucket, file.ObjectKey);
            }

            photoDtos.Add(new WorkOrderPhotoDto
            {
                Id = photo.Id,
                PhotoType = photo.PhotoType,
                FileName = file?.OriginalName ?? "unknown",
                DownloadUrl = downloadUrl,
                GpsLat = photo.GpsLat,
                GpsLng = photo.GpsLng,
                CapturedBy = photo.CapturedBy,
                CreatedAt = photo.CreatedAt
            });
        }

        return new WorkOrderDto
        {
            Id = wo.Id,
            OrderNumber = wo.OrderNumber,
            Title = wo.Title,
            Type = wo.Type,
            Priority = wo.Priority,
            Status = wo.Status,
            LocationId = wo.LocationId,
            Description = wo.Description,
            AssetId = wo.AssetId,
            AssetName = asset?.Name,
            LocationName = location?.Name,
            ReportedBy = wo.ReportedBy,
            ScheduledStart = wo.ScheduledStart,
            ActualStart = wo.ActualStart,
            ActualEnd = wo.ActualEnd,
            SlaDeadline = wo.SlaDeadline,
            Assignees = assignees.Select(a => new WorkOrderAssigneeDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Role = a.Role,
                AssignedAt = a.CreatedAt
            }).ToList(),
            Photos = photoDtos,
            CreatedAt = wo.CreatedAt
        };
    }
}
