using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlanMeter;

public class UpdateMaintenancePlanMeterCommandHandler : IRequestHandler<UpdateMaintenancePlanMeterCommand, bool>
{
    private readonly IRepository<MaintenancePlan> _planRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public UpdateMaintenancePlanMeterCommandHandler(
        IRepository<MaintenancePlan> planRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<bool> Handle(UpdateMaintenancePlanMeterCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"MaintenancePlan {request.PlanId} not found.");

        if (plan.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Plan does not belong to current tenant.");
        }

        if (request.CurrentMeterReading < plan.CurrentMeterReading)
        {
            throw new InvalidOperationException("Current meter reading cannot decrease.");
        }

        plan.CurrentMeterReading = request.CurrentMeterReading;
        _planRepository.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
