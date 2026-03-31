using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class Location : AuditableEntity, ITenantScoped
{
    public string Name { get; set; } = default!;
    public LocationType Type { get; set; }
    public Guid? ParentId { get; set; }
    public string? NfcTagId { get; set; }
    public string? Barcode { get; set; }
    public bool IsLinear { get; set; }
    public decimal GpsLatStart { get; set; }
    public decimal GpsLngStart { get; set; }
    public decimal GpsLatEnd { get; set; }
    public decimal GpsLngEnd { get; set; }
    public bool IsCommonArea { get; set; }
    public string? Metadata { get; set; }

    // Navigation properties
    public Location? Parent { get; set; }
    public ICollection<Location> Children { get; set; } = new List<Location>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
