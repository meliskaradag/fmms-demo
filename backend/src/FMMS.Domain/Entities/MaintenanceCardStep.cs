using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class MaintenanceCardStep : AuditableEntity, ITenantScoped
{
    public Guid CardId { get; set; }
    public int StepOrder { get; set; }
    public string Instruction { get; set; } = default!;
    public StepStatus StepStatus { get; set; } = StepStatus.Mandatory;
    public int EstimatedMinutes { get; set; }

    // Navigation properties
    public MaintenanceCard Card { get; set; } = default!;
}
