using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class MaintenancePlanRunDto
{
    public Guid Id { get; set; }
    public Guid MaintenancePlanId { get; set; }
    public string MaintenancePlanName { get; set; } = default!;
    public string AssetName { get; set; } = default!;
    public string? StockCardName { get; set; }
    public Guid? WorkOrderId { get; set; }
    public DateTime TriggeredAt { get; set; }
    public string TriggerReason { get; set; } = default!;
    public MaintenancePlanRunStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

