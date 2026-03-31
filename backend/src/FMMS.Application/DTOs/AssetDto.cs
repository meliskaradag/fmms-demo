using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class AssetDto
{
    public Guid Id { get; set; }
    public string AssetNumber { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string Manufacturer { get; set; } = default!;
    public string Model { get; set; } = default!;
    public string? SerialNumber { get; set; }
    public AssetStatus Status { get; set; }
    public Guid LocationId { get; set; }
    public string LocationName { get; set; } = default!;
    public DateTime? InstallationDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
