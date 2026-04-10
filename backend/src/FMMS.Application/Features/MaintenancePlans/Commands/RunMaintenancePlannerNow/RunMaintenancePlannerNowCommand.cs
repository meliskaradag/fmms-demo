using FMMS.Application.Interfaces;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.RunMaintenancePlannerNow;

public record RunMaintenancePlannerNowCommand : IRequest<PeriodicMaintenanceExecutionResult>;
