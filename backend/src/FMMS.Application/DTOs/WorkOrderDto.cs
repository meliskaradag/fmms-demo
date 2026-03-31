using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class WorkOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public Guid? AssetId { get; set; }
    public string? AssetName { get; set; }
    public WorkOrderType Type { get; set; }
    public Priority Priority { get; set; }
    public WorkOrderStatus Status { get; set; }
    public Guid LocationId { get; set; }
    public string? LocationName { get; set; }
    public Guid ReportedBy { get; set; }
    public DateTime? ScheduledStart { get; set; }
    public DateTime? ActualStart { get; set; }
    public DateTime? ActualEnd { get; set; }
    public DateTime? SlaDeadline { get; set; }
    public bool IsOverdue => SlaDeadline.HasValue && SlaDeadline < DateTime.UtcNow && Status != WorkOrderStatus.Completed && Status != WorkOrderStatus.Cancelled;
    public List<WorkOrderAssigneeDto> Assignees { get; set; } = new();
    public List<WorkOrderPhotoDto> Photos { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
