namespace FMMS.Application.Interfaces;

public interface IPeriodicMaintenancePlanner
{
    Task<PeriodicMaintenanceExecutionResult> ExecuteForAllTenantsAsync(CancellationToken cancellationToken = default);
    Task<PeriodicMaintenanceExecutionResult> ExecuteForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public record PeriodicMaintenanceExecutionResult(
    int WorkOrdersCreated,
    int BlockedByStock,
    int SkippedExistingOpenWorkOrder
);
