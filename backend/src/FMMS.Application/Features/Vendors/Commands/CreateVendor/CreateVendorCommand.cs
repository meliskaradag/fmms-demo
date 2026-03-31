using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Vendors.Commands.CreateVendor;

public record CreateVendorCommand(
    string Name,
    string Code,
    VendorType VendorType,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    string? TaxNumber,
    DateTime? ContractStart,
    DateTime? ContractEnd
) : IRequest<Guid>;
