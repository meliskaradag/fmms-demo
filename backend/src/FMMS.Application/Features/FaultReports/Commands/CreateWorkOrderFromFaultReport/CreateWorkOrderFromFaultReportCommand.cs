using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateWorkOrderFromFaultReport;

public record CreateWorkOrderFromFaultReportCommand(
    Guid FaultReportId,
    Guid ReviewedBy) : IRequest<Guid>;
