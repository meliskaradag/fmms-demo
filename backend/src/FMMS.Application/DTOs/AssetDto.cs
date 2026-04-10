using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetTag { get; set; } = default!;
    public Guid? ItemId { get; set; }
    public string AssetNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public AssetCondition Condition { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string Manufacturer { get; set; } = default!;
    public string? Brand { get; set; }
    public string Model { get; set; } = default!;
    public string? SerialNumber { get; set; }
    public string? Specifications { get; set; }
    public AssetStatus Status { get; set; }
    public Guid? ParentAssetId { get; set; }
    public Guid LocationId { get; set; }
    public string LocationName { get; set; } = default!;
    public DateTime? InstallationDate { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchaseCost { get; set; }
    public Guid? SupplierId { get; set; }
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public WarrantyState WarrantyState { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
