using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class Asset : AuditableEntity, ITenantScoped
{
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public Guid LocationId { get; set; }
    public Guid? ParentAssetId { get; set; }
    public string AssetNumber { get; set; } = default!;
    public AssetStatus Status { get; set; }
    public string? Barcode { get; set; }
    public string? NfcTagId { get; set; }
    public DateTime? InstallationDate { get; set; }
    public string BatchNumber { get; set; } = default!;
    public string Manufacturer { get; set; } = default!;
    public string Model { get; set; } = default!;
    public string? SerialNumber { get; set; }
    public Guid? StockCardId { get; set; }
    public string? Metadata { get; set; }

    // Navigation properties
    public Location Location { get; set; } = default!;
    public Asset? ParentAsset { get; set; }
    public ICollection<Asset> ChildAssets { get; set; } = new List<Asset>();
}
