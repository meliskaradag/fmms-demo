using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Queries.GetWorkOrders;

public record GetWorkOrdersQuery(
    WorkOrderStatus? Status,
    Priority? PriorityFilter,
    Guid? LocationId,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<WorkOrderDto>>;
