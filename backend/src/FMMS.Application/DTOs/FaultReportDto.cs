using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class FaultReportDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public Guid LocationId { get; set; }
    public string? LocationName { get; set; }
    public Guid? AssetId { get; set; }
    public string? AssetName { get; set; }
    public Priority Priority { get; set; }
    public FaultReportStatus Status { get; set; }
    public Guid ReportedBy { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? ReviewNote { get; set; }
    public Guid? LinkedWorkOrderId { get; set; }
    public List<FaultReportPhotoDto> Photos { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class FaultReportPhotoDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = default!;
    public string Base64Data { get; set; } = default!;
    public decimal GpsLat { get; set; }
    public decimal GpsLng { get; set; }
    public DateTime CreatedAt { get; set; }
}
