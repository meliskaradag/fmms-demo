using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class MaintenancePlanRun : AuditableEntity, ITenantScoped
{
    public Guid MaintenancePlanId { get; set; }
    public Guid? WorkOrderId { get; set; }
    public DateTime TriggeredAt { get; set; }
    public string TriggerReason { get; set; } = default!;
    public MaintenancePlanRunStatus Status { get; set; }
    public string? MissingMaterialsJson { get; set; }

    public MaintenancePlan MaintenancePlan { get; set; } = default!;
    public WorkOrder? WorkOrder { get; set; }
}
