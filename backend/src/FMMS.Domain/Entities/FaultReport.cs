using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class FaultReport : AuditableEntity, ITenantScoped
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public Guid LocationId { get; set; }
    public Guid? AssetId { get; set; }
    public Priority Priority { get; set; }
    public FaultReportStatus Status { get; set; }
    public Guid ReportedBy { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? ReviewNote { get; set; }
    public Guid? LinkedWorkOrderId { get; set; }

    // Navigation properties
    public Location Location { get; set; } = default!;
    public Asset? Asset { get; set; }
    public WorkOrder? LinkedWorkOrder { get; set; }
    public ICollection<FaultReportPhoto> Photos { get; set; } = new List<FaultReportPhoto>();
}
