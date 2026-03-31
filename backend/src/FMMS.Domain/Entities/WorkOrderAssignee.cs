using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class WorkOrderAssignee : AuditableEntity, ITenantScoped
{
    public Guid WorkOrderId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "technician";

    // Navigation properties
    public WorkOrder WorkOrder { get; set; } = default!;
}
