using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class ServiceAgreement : AuditableEntity, ITenantScoped
{
    public Guid VendorId { get; set; }
    public string AgreementNumber { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? ScopeDescription { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AutoRenew { get; set; }
    public int SlaResponseHours { get; set; }
    public int SlaResolutionHours { get; set; }
    public decimal Cost { get; set; }
    public string Currency { get; set; } = "TRY";
    public AgreementStatus Status { get; set; }
    public string CoveredAssetIds { get; set; } = default!;
    public string CoveredMaintTypes { get; set; } = default!;

    // Navigation properties
    public Vendor Vendor { get; set; } = default!;
}
