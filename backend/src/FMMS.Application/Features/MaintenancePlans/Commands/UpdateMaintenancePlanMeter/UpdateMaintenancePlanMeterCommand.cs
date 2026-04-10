using MediatR;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlanMeter;

public record UpdateMaintenancePlanMeterCommand(
    Guid PlanId,
    decimal CurrentMeterReading
) : IRequest<bool>;
