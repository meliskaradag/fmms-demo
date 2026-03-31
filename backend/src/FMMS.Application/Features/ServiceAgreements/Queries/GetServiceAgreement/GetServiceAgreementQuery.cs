using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreement;

public record GetServiceAgreementQuery(Guid Id) : IRequest<ServiceAgreementDto?>;
