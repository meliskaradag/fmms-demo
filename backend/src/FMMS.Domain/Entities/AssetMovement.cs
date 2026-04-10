using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class AssetMovement : AuditableEntity, ITenantScoped
{
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

    public Asset Asset { get; set; } = default!;
}
