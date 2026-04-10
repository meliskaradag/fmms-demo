using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlans;

public record GetMaintenancePlansQuery(
    int Page = 1,
    int PageSize = 20,
    bool? IsActive = null
) : IRequest<PagedResult<MaintenancePlanDto>>;
