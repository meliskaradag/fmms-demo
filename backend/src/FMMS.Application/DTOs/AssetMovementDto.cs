using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class AssetMovementDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public AssetMovementType MovementType { get; set; }
    public Guid? FromLocationId { get; set; }
    public Guid? ToLocationId { get; set; }
    public Guid? FromUserId { get; set; }
    public Guid? ToUserId { get; set; }
    public string? Reason { get; set; }
    public Guid? MovedBy { get; set; }
    public DateTime MovedAt { get; set; }
    public string? Notes { get; set; }
}
