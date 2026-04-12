using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateWorkOrderFromFaultReport;

public class CreateWorkOrderFromFaultReportCommand : IRequest<Guid>
{
    public Guid FaultReportId { get; set; }
    public Guid ReviewedBy { get; set; }
}
