using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class MaintenanceCard : AuditableEntity, ITenantScoped
{
    public string Name { get; set; } = default!;
    public string? AssetCategory { get; set; }
    public string? Description { get; set; }
    public TimeSpan? EstimatedDuration { get; set; }
    public MaintenanceLevel Level { get; set; }
    public int DefaultPeriodDays { get; set; }
    public bool IsTemplate { get; set; }

    // Navigation properties
    public ICollection<MaintenanceCardStep> Steps { get; set; } = new List<MaintenanceCardStep>();
    public ICollection<MaintenanceCardMaterial> Materials { get; set; } = new List<MaintenanceCardMaterial>();
}
