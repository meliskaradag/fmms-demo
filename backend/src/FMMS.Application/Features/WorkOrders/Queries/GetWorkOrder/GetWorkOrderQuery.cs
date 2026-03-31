using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.WorkOrders.Queries.GetWorkOrder;

public record GetWorkOrderQuery(Guid Id) : IRequest<WorkOrderDto?>;
