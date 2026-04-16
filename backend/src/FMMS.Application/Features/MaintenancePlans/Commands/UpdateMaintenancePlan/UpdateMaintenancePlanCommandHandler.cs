using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlan;

public class UpdateMaintenancePlanCommandHandler : IRequestHandler<UpdateMaintenancePlanCommand, bool>
{
    private readonly IRepository<MaintenancePlan> _planRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public UpdateMaintenancePlanCommandHandler(
        IRepository<MaintenancePlan> planRepository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _planRepository = planRepository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<bool> Handle(UpdateMaintenancePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"MaintenancePlan {request.PlanId} not found.");

        if (plan.TenantId != _tenantContext.TenantId)
        {
            throw new InvalidOperationException("Plan does not belong to current tenant.");
        }

        if (plan.TriggerType is MaintenancePlanTriggerType.TimeBased or MaintenancePlanTriggerType.Hybrid)
        {
            if (!request.FirstDueAt.HasValue)
                throw new InvalidOperationException("First due date is required for time-based plans.");
            if (!request.FrequencyDays.HasValue || request.FrequencyDays.Value <= 0)
                throw new InvalidOperationException("Frequency days must be greater than zero for time-based plans.");

            plan.FrequencyDays = request.FrequencyDays.Value;
            plan.NextDueAt = request.FirstDueAt.Value;
        }

        plan.Name = request.Name;
        plan.Priority = request.Priority;
        plan.IsActive = request.IsActive;

        _planRepository.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

