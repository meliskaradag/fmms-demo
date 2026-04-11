using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.AddFaultReportPhoto;

public record AddFaultReportPhotoCommand(
    Guid FaultReportId,
    string FileName,
    string ContentType,
    string Base64Data,
    decimal GpsLat,
    decimal GpsLng) : IRequest<Guid>;
