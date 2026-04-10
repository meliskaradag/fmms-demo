namespace FMMS.Domain.Enums;

public enum AssetHistoryActionType
{
    Created = 0,
    Updated = 1,
    StatusChanged = 2,
    LocationChanged = 3,
    Assigned = 4,
    Unassigned = 5,
    MaintenanceLinked = 6,
    MaintenanceCompleted = 7,
    WarrantyUpdated = 8,
    NoteAdded = 9,
    ParentChanged = 10
}
