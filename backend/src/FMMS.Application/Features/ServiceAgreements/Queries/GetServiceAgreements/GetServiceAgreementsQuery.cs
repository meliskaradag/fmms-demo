using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreements;

public record GetServiceAgreementsQuery(
    Guid? VendorId,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<ServiceAgreementDto>>;
