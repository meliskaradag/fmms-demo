using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class MaintenanceCardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? AssetCategory { get; set; }
    public string? Description { get; set; }
    public MaintenanceLevel Level { get; set; }
    public TimeSpan? EstimatedDuration { get; set; }
    public int DefaultPeriodDays { get; set; }
    public bool IsTemplate { get; set; }
    public List<MaintenanceCardStepDto> Steps { get; set; } = new();
    public List<MaintenanceCardMaterialDto> Materials { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
