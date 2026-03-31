namespace FMMS.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string LegalName { get; set; } = default!;
    public string TradeName { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string SchemaName { get; set; } = default!;
    public string TaxOffice { get; set; } = default!;
    public string TaxNumber { get; set; } = default!;
    public string BillingAddress { get; set; } = default!;
    public string BillingCity { get; set; } = default!;
    public string BillingCountry { get; set; } = "TR";
    public string ContactEmail { get; set; } = default!;
    public string ContactPhone { get; set; } = default!;
    public string SubscriptionPlan { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public string Settings { get; set; } = default!;
}
