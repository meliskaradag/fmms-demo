using FMMS.Domain.Enums;

namespace FMMS.Application.DTOs;

public class ServiceAgreementDto
{
    public Guid Id { get; set; }
    public string AgreementNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public AgreementStatus Status { get; set; }
    public int SlaResponseHours { get; set; }
    public int SlaResolutionHours { get; set; }
    public List<Guid> CoveredAssetIds { get; set; } = new();
    public decimal MonthlyFee { get; set; }
    public decimal AnnualFee { get; set; }
    public DateTime CreatedAt { get; set; }
}
