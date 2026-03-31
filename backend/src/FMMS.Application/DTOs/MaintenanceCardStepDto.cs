using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class MaintenanceCardStepDto
{
    public Guid Id { get; set; }
    public int StepOrder { get; set; }
    public string Instruction { get; set; } = default!;
    public StepStatus StepStatus { get; set; }
    public int EstimatedMinutes { get; set; }
}
