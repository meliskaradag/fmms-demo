using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.ReviewFaultReport;

public class ReviewFaultReportCommand : IRequest
{
    public Guid FaultReportId { get; set; }
    public FaultReportStatus NewStatus { get; set; }
    public Guid ReviewedBy { get; set; }
    public string? ReviewNote { get; set; }
}
