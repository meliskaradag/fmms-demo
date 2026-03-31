using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.CreateWorkOrder;

public record CreateWorkOrderCommand(
    string Title,
    WorkOrderType Type,
    Priority Priority,
    Guid LocationId,
    Guid ReportedBy,
    DateTime? ScheduledStart,
    DateTime? SlaDeadline,
    string? Description,
    Guid? AssetId) : IRequest<Guid>;
