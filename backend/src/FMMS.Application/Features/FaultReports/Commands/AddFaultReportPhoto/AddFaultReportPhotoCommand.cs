using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.AddFaultReportPhoto;

public class AddFaultReportPhotoCommand : IRequest<Guid>
{
    public Guid FaultReportId { get; set; }
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = "image/jpeg";
    public string Base64Data { get; set; } = default!;
    public decimal GpsLat { get; set; }
    public decimal GpsLng { get; set; }
}
