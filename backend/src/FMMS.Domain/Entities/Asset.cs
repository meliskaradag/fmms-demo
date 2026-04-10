using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class Asset : AuditableEntity, ITenantScoped
{
    // Legacy field kept for backward compatibility
    public string AssetNumber { get; set; } = default!;
    public string AssetTag { get; set; } = default!;
    public Guid? ItemId { get; set; }
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public Guid LocationId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public Guid? ParentAssetId { get; set; }
    public AssetStatus Status { get; set; }
    public AssetCondition Condition { get; set; } = AssetCondition.Good;
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
    public string? NfcTagId { get; set; }
    public DateTime? InstallationDate { get; set; }
    public string BatchNumber { get; set; } = default!;
    public string Manufacturer { get; set; } = default!;
    public string? Brand { get; set; }
    public string Model { get; set; } = default!;
    public string? SerialNumber { get; set; }
    public string? Specifications { get; set; }
    public Guid? StockCardId { get; set; }
    public Guid? SupplierId { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchaseCost { get; set; }
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? Metadata { get; set; }

    // Navigation properties
    public Location Location { get; set; } = default!;
    public Asset? ParentAsset { get; set; }
    public ICollection<Asset> ChildAssets { get; set; } = new List<Asset>();
    public ICollection<AssetHistory> Histories { get; set; } = new List<AssetHistory>();
    public ICollection<AssetMovement> Movements { get; set; } = new List<AssetMovement>();
}
