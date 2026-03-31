using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.AssignWorkOrder;

public record AssignWorkOrderCommand(
    Guid WorkOrderId,
    Guid UserId,
    string Role = "technician") : IRequest<Guid>;
