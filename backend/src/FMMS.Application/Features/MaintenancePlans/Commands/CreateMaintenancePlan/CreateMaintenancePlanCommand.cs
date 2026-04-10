using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.CreateMaintenancePlan;

public record CreateMaintenancePlanCommand(
    string Name,
    Guid MaintenanceCardId,
    Guid AssetId,
    MaintenancePlanTriggerType TriggerType,
    DateTime? FirstDueAt,
    int? FrequencyDays,
    decimal? MeterInterval,
    decimal InitialMeterReading,
    Priority Priority,
    bool IsActive
) : IRequest<Guid>;
