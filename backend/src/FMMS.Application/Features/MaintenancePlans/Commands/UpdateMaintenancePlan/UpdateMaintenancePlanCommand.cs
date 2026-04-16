using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlan;

public record UpdateMaintenancePlanCommand(
    Guid PlanId,
    string Name,
    DateTime? FirstDueAt,
    int? FrequencyDays,
    Priority Priority,
    bool IsActive
) : IRequest<bool>;

