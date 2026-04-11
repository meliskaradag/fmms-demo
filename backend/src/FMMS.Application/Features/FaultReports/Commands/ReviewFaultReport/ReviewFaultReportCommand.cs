using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.ReviewFaultReport;

public record ReviewFaultReportCommand(
    Guid FaultReportId,
    FaultReportStatus NewStatus,
    Guid ReviewedBy,
    string? ReviewNote) : IRequest;
