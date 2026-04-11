using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateFaultReport;

public record CreateFaultReportCommand(
    string Title,
    string? Description,
    Guid LocationId,
    Guid? AssetId,
    Priority Priority,
    Guid ReportedBy) : IRequest<Guid>;
