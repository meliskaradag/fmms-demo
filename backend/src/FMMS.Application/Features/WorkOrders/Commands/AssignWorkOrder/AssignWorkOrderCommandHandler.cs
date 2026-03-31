using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.AssignWorkOrder;

public class AssignWorkOrderCommandHandler : IRequestHandler<AssignWorkOrderCommand, Guid>
{
    private readonly IRepository<WorkOrder> _woRepo;
    private readonly IRepository<WorkOrderAssignee> _assigneeRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public AssignWorkOrderCommandHandler(
        IRepository<WorkOrder> woRepo,
        IRepository<WorkOrderAssignee> assigneeRepo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _woRepo = woRepo;
        _assigneeRepo = assigneeRepo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(AssignWorkOrderCommand request, CancellationToken cancellationToken)
    {
        var workOrder = await _woRepo.GetByIdAsync(request.WorkOrderId, cancellationToken)
            ?? throw new KeyNotFoundException($"WorkOrder {request.WorkOrderId} not found.");

        var existingAssignee = _assigneeRepo
            .GetQueryable()
            .FirstOrDefault(a => a.WorkOrderId == request.WorkOrderId && a.UserId == request.UserId);

        if (existingAssignee is not null)
        {
            // Already assigned; keep idempotent behavior on repeated clicks.
            // Ensure status is consistent with assignment state.
            if (workOrder.Status == WorkOrderStatus.Open)
            {
                workOrder.Status = WorkOrderStatus.Assigned;
                _woRepo.Update(workOrder);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return existingAssignee.Id;
        }

        var assignee = new WorkOrderAssignee
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            WorkOrderId = request.WorkOrderId,
            UserId = request.UserId,
            Role = request.Role
        };

        await _assigneeRepo.AddAsync(assignee, cancellationToken);

        // Auto-transition to Assigned if still Open
        if (workOrder.Status == WorkOrderStatus.Open)
        {
            workOrder.Status = WorkOrderStatus.Assigned;
            _woRepo.Update(workOrder);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return assignee.Id;
    }
}
