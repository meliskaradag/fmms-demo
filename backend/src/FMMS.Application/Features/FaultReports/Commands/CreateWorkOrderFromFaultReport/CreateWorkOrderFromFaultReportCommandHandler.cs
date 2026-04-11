using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.FaultReports.Commands.CreateWorkOrderFromFaultReport;

public class CreateWorkOrderFromFaultReportCommandHandler : IRequestHandler<CreateWorkOrderFromFaultReportCommand, Guid>
{
    private readonly IRepository<FaultReport> _faultRepo;
    private readonly IRepository<WorkOrder> _workOrderRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateWorkOrderFromFaultReportCommandHandler(
        IRepository<FaultReport> faultRepo,
        IRepository<WorkOrder> workOrderRepo,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _faultRepo = faultRepo;
        _workOrderRepo = workOrderRepo;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateWorkOrderFromFaultReportCommand request, CancellationToken cancellationToken)
    {
        var faultReport = await _faultRepo.GetByIdAsync(request.FaultReportId, cancellationToken)
            ?? throw new KeyNotFoundException($"FaultReport {request.FaultReportId} not found");

        var orderNumber = $"WO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var workOrder = new WorkOrder
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantContext.TenantId,
            OrderNumber = orderNumber,
            Title = faultReport.Title,
            Description = faultReport.Description,
            Type = WorkOrderType.Corrective,
            Priority = faultReport.Priority,
            Status = WorkOrderStatus.Open,
            LocationId = faultReport.LocationId,
            AssetId = faultReport.AssetId,
            ReportedBy = faultReport.ReportedBy
        };

        await _workOrderRepo.AddAsync(workOrder, cancellationToken);

        faultReport.Status = FaultReportStatus.Accepted;
        faultReport.ReviewedBy = request.ReviewedBy;
        faultReport.LinkedWorkOrderId = workOrder.Id;
        faultReport.UpdatedAt = DateTime.UtcNow;
        _faultRepo.Update(faultReport);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return workOrder.Id;
    }
}
