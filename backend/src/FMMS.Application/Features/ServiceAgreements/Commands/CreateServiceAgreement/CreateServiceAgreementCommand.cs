using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Commands.CreateServiceAgreement;

public record CreateServiceAgreementCommand(
    string AgreementNumber,
    Guid VendorId,
    string? ContactInfo,
    DateTime StartDate,
    DateTime EndDate,
    bool AutoRenew,
    int SlaResponseHours,
    int SlaResolutionHours,
    decimal Cost,
    string Currency,
    AgreementStatus Status,
    List<Guid> CoveredAssetIds,
    List<Guid>? CoveredStockCardIds
) : IRequest<Guid>;
