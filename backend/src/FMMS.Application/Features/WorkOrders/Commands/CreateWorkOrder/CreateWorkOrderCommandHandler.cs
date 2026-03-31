using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Commands.CreateWorkOrder;

public class CreateWorkOrderCommandHandler : IRequestHandler<CreateWorkOrderCommand, Guid>
{
    private readonly IRepository<WorkOrder> _repo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateWorkOrderCommandHandler(
        IRepository<WorkOrder> repo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateWorkOrderCommand request, CancellationToken cancellationToken)
    {
        var orderNumber = $"WO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var workOrder = new WorkOrder
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            OrderNumber = orderNumber,
            Title = request.Title,
            Type = request.Type,
            Priority = request.Priority,
            Status = WorkOrderStatus.Open,
            LocationId = request.LocationId,
            ReportedBy = request.ReportedBy,
            ScheduledStart = request.ScheduledStart.HasValue ? DateTime.SpecifyKind(request.ScheduledStart.Value, DateTimeKind.Utc) : null,
            SlaDeadline = request.SlaDeadline.HasValue ? DateTime.SpecifyKind(request.SlaDeadline.Value, DateTimeKind.Utc) : null,
            Description = request.Description,
            AssetId = request.AssetId
        };

        await _repo.AddAsync(workOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return workOrder.Id;
    }
}
