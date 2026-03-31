using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class WorkOrderPhoto : AuditableEntity, ITenantScoped
{
    public Guid WorkOrderId { get; set; }
    public PhotoType PhotoType { get; set; }
    public Guid FileObjectId { get; set; }
    public decimal GpsLat { get; set; }
    public decimal GpsLng { get; set; }
    public Guid? CapturedBy { get; set; }
    public string? FileMetadata { get; set; }

    // Navigation properties
    public WorkOrder WorkOrder { get; set; } = default!;
    public FileObject FileObject { get; set; } = default!;
}
