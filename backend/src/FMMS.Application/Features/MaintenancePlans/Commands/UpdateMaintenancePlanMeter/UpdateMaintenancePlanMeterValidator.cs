using FluentValidation;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlanMeter;

public class UpdateMaintenancePlanMeterValidator : AbstractValidator<UpdateMaintenancePlanMeterCommand>
{
    public UpdateMaintenancePlanMeterValidator()
    {
        RuleFor(x => x.PlanId).NotEmpty();
        RuleFor(x => x.CurrentMeterReading).GreaterThanOrEqualTo(0);
    }
}
