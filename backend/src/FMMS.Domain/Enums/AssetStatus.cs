namespace FMMS.Domain.Enums;

public enum AssetStatus
{
    Active = 0,
    Broken = 1,
    InMaintenance = 2,
    Retired = 3,
    Disposed = 4,
    InStock = 5,
    Assigned = 6,

    // Legacy aliases for backward compatibility
    Faulty = Broken,
    UnderMaint = InMaintenance,
    AwaitingSvc = Retired,
    Decommissioned = Disposed
}
