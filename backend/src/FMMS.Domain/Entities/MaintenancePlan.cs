using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class MaintenancePlan : AuditableEntity, ITenantScoped
{
    public string Name { get; set; } = default!;
    public Guid MaintenanceCardId { get; set; }
    public Guid? AssetId { get; set; }
    public Guid? StockCardId { get; set; }
    public MaintenancePlanTriggerType TriggerType { get; set; }
    public int? FrequencyDays { get; set; }
    public decimal? MeterInterval { get; set; }
    public decimal CurrentMeterReading { get; set; }
    public DateTime? NextDueAt { get; set; }
    public decimal? NextDueMeter { get; set; }
    public DateTime? LastRunAt { get; set; }
    public Priority Priority { get; set; }
    public bool IsActive { get; set; } = true;

    public MaintenanceCard MaintenanceCard { get; set; } = default!;
    public Asset? Asset { get; set; }
    public StockCard? StockCard { get; set; }
    public ICollection<MaintenancePlanRun> Runs { get; set; } = new List<MaintenancePlanRun>();
}
