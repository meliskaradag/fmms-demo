using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCards;

public record GetMaintenanceCardsQuery(
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<MaintenanceCardDto>>;
