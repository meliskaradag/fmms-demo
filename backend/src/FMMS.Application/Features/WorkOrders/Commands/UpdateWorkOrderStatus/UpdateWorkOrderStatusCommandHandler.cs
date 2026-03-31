using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.UpdateWorkOrderStatus;

public class UpdateWorkOrderStatusCommandHandler : IRequestHandler<UpdateWorkOrderStatusCommand, bool>
{
    private readonly IRepository<WorkOrder> _repo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWorkOrderStatusCommandHandler(IRepository<WorkOrder> repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateWorkOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var workOrder = await _repo.GetByIdAsync(request.WorkOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"WorkOrder {request.WorkOrderId} not found.");

        ValidateTransition(workOrder.Status, request.NewStatus);

        workOrder.Status = request.NewStatus;

        // Set timestamps on key transitions
        if (request.NewStatus == WorkOrderStatus.InProgress)
            workOrder.ActualStart = DateTime.UtcNow;

        if (request.NewStatus == WorkOrderStatus.Completed)
            workOrder.ActualEnd = DateTime.UtcNow;

        _repo.Update(workOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static void ValidateTransition(WorkOrderStatus current, WorkOrderStatus target)
    {
        var allowed = current switch
        {
            WorkOrderStatus.Open => new[] { WorkOrderStatus.Assigned, WorkOrderStatus.Cancelled },
            WorkOrderStatus.Assigned => new[] { WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled },
            WorkOrderStatus.InProgress => new[] { WorkOrderStatus.OnHold, WorkOrderStatus.Completed, WorkOrderStatus.Cancelled },
            WorkOrderStatus.OnHold => new[] { WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled },
            _ => Array.Empty<WorkOrderStatus>()
        };

        if (!allowed.Contains(target))
            throw new InvalidOperationException($"Cannot transition from {current} to {target}.");
    }
}
