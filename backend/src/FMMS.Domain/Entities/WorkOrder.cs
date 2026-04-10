using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class WorkOrder : AuditableEntity, ITenantScoped
{
    public string OrderNumber { get; set; } = default!;
    public WorkOrderType Type { get; set; }
    public Priority Priority { get; set; }
    public WorkOrderStatus Status { get; set; }
    public string Title { get; set; } = default!;
    public Guid ReportedBy { get; set; }
    public Guid LocationId { get; set; }
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public DateTime? SlaDeadline { get; set; }
    public string? SpeechToTextNote { get; set; }
    public string? Description { get; set; }
    public Guid? AssetId { get; set; }
    public Guid? MaintenancePlanId { get; set; }

    // Navigation properties
    public Location Location { get; set; } = default!;
    public Asset? Asset { get; set; }
    public MaintenancePlan? MaintenancePlan { get; set; }
    public ICollection<WorkOrderPhoto> Photos { get; set; } = new List<WorkOrderPhoto>();
    public ICollection<WorkOrderAssignee> Assignees { get; set; } = new List<WorkOrderAssignee>();
}
