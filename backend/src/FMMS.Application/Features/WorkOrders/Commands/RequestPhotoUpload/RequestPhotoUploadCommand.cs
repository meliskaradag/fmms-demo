using FMMS.Application.DTOs;
using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.RequestPhotoUpload;

public record RequestPhotoUploadCommand(
    Guid WorkOrderId,
    PhotoType PhotoType,
    string FileName,
    string ContentType,
    decimal GpsLat = 0,
    decimal GpsLng = 0) : IRequest<PresignedUrlDto>;
