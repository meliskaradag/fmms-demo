using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class MaintenancePlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public Guid MaintenanceCardId { get; set; }
    public string MaintenanceCardName { get; set; } = default!;
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = default!;
    public MaintenancePlanTriggerType TriggerType { get; set; }
    public int? FrequencyDays { get; set; }
    public decimal? MeterInterval { get; set; }
    public decimal CurrentMeterReading { get; set; }
    public DateTime? NextDueAt { get; set; }
    public decimal? NextDueMeter { get; set; }
    public DateTime? LastRunAt { get; set; }
    public Priority Priority { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
