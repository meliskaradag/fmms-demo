using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlanRuns;

public record GetMaintenancePlanRunsQuery(
    Guid? PlanId = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<MaintenancePlanRunDto>>;

