using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class WorkOrderPhotoDto
{
    public Guid Id { get; set; }
    public PhotoType PhotoType { get; set; }
    public string FileName { get; set; } = default!;
    public string? DownloadUrl { get; set; }
    public decimal GpsLat { get; set; }
    public decimal GpsLng { get; set; }
    public Guid? CapturedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
