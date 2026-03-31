namespace FMMS.Application.DTOs;

public class WorkOrderAssigneeDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "technician";
    public DateTime AssignedAt { get; set; }
}
