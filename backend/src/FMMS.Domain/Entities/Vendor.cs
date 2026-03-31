using FMMS.Domain.Common;
using FMMS.Domain.Enums;

namespace FMMS.Domain.Entities;

public class Vendor : AuditableEntity, ITenantScoped
{
    public string TradeName { get; set; } = default!;
    public string InvoiceName { get; set; } = default!;
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public VendorType VendorType { get; set; }
    public DateTime? ContractStart { get; set; }
    public DateTime? ContractEnd { get; set; }
    public decimal Rating { get; set; }

    // Navigation properties
    public ICollection<ServiceAgreement> ServiceAgreements { get; set; } = new List<ServiceAgreement>();
}
