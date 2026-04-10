using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class AssetHistoryDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public AssetHistoryActionType ActionType { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid? PerformedBy { get; set; }
    public DateTime PerformedAt { get; set; }
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? Note { get; set; }
}
