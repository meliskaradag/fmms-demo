using FMMS.Application.DTOs;
using FMMS.Application.Interfaces;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.RequestPhotoUpload;

public class RequestPhotoUploadCommandHandler : IRequestHandler<RequestPhotoUploadCommand, PresignedUrlDto>
{
    private readonly IRepository<WorkOrder> _woRepo;
    private readonly IRepository<FileObject> _fileRepo;
    private readonly IRepository<WorkOrderPhoto> _photoRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;
    private readonly IStorageService _storageService;

    private const string BucketName = "fmms-photos";

    public RequestPhotoUploadCommandHandler(
        IRepository<WorkOrder> woRepo,
        IRepository<FileObject> fileRepo,
        IRepository<WorkOrderPhoto> photoRepo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext,
        IStorageService storageService)
    {
        _woRepo = woRepo;
        _fileRepo = fileRepo;
        _photoRepo = photoRepo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
        _storageService = storageService;
    }

    public async Task<PresignedUrlDto> Handle(RequestPhotoUploadCommand request, CancellationToken cancellationToken)
    {
        // Verify work order exists
        _ = await _woRepo.GetByIdAsync(request.WorkOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"WorkOrder {request.WorkOrderId} not found.");

        // Generate object key: tenants/{slug}/wo/{woId}/{photoType}/{guid}.{ext}
        var ext = Path.GetExtension(request.FileName).TrimStart('.');
        var objectKey = $"tenants/{_tenantContext.TenantSlug}/wo/{request.WorkOrderId}/{request.PhotoType.ToString().ToLower()}/{Guid.NewGuid()}.{ext}";

        // Create FileObject record
        var fileObject = new FileObject
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            ObjectKey = objectKey,
            Bucket = BucketName,
            OriginalName = request.FileName,
            ContentType = request.ContentType,
            SizeBytes = 0 // Will be set after upload in a real scenario
        };

        await _fileRepo.AddAsync(fileObject, cancellationToken);

        // Create WorkOrderPhoto record
        var photo = new WorkOrderPhoto
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            WorkOrderId = request.WorkOrderId,
            PhotoType = request.PhotoType,
            FileObjectId = fileObject.Id,
            GpsLat = request.GpsLat,
            GpsLng = request.GpsLng
        };

        await _photoRepo.AddAsync(photo, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Generate presigned upload URL
        var expirySeconds = 3600;
        var uploadUrl = await _storageService.GeneratePresignedUploadUrl(
            BucketName, objectKey, request.ContentType, expirySeconds);

        return new PresignedUrlDto
        {
            UploadUrl = uploadUrl,
            ObjectKey = objectKey,
            ExpiresAt = DateTime.UtcNow.AddSeconds(expirySeconds)
        };
    }
}
