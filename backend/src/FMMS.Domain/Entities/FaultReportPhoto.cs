using FMMS.Domain.Common;

namespace FMMS.Domain.Entities;

public class FaultReportPhoto : AuditableEntity, ITenantScoped
{
    public Guid FaultReportId { get; set; }
    public string FileName { get; set; } = default!;
    public string ContentType { get; set; } = "image/jpeg";
    public string Base64Data { get; set; } = default!;
    public decimal GpsLat { get; set; }
    public decimal GpsLng { get; set; }

    // Navigation properties
    public FaultReport FaultReport { get; set; } = default!;
}
