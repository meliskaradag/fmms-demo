using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Commands.CreateServiceAgreement;

public record CreateServiceAgreementCommand(
    string AgreementNumber,
    Guid VendorId,
    string Title,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    bool AutoRenew,
    int SlaResponseHours,
    int SlaResolutionHours,
    decimal Cost,
    string Currency,
    AgreementStatus Status,
    List<Guid> CoveredAssetIds,
    string? CoveredMaintTypes
) : IRequest<Guid>;
