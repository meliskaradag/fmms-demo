using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.UpdateWorkOrderStatus;

public record UpdateWorkOrderStatusCommand(
    Guid WorkOrderId,
    WorkOrderStatus NewStatus) : IRequest<bool>;
