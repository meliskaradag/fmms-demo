using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateFaultReport;

public class CreateFaultReportCommand : IRequest<Guid>
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public Guid LocationId { get; set; }
    public Guid? AssetId { get; set; }
    public Priority Priority { get; set; }
    public Guid ReportedBy { get; set; }
}
