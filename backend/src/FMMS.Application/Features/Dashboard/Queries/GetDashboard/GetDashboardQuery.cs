using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Dashboard.Queries.GetDashboard;

public record GetDashboardQuery() : IRequest<DashboardDto>;
