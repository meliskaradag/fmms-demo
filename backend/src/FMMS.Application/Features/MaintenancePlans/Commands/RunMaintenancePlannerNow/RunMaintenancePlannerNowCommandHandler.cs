using FMMS.Application.Interfaces;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.RunMaintenancePlannerNow;

public class RunMaintenancePlannerNowCommandHandler : IRequestHandler<RunMaintenancePlannerNowCommand, PeriodicMaintenanceExecutionResult>
{
    private readonly IPeriodicMaintenancePlanner _planner;
    private readonly ITenantContext _tenantContext;

    public RunMaintenancePlannerNowCommandHandler(IPeriodicMaintenancePlanner planner, ITenantContext tenantContext)
    {
        _planner = planner;
        _tenantContext = tenantContext;
    }

    public async Task<PeriodicMaintenanceExecutionResult> Handle(RunMaintenancePlannerNowCommand request, CancellationToken cancellationToken)
    {
        return await _planner.ExecuteForTenantAsync(_tenantContext.TenantId, cancellationToken);
    }
}
