using FluentValidation;

namespace FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlan;

public class UpdateMaintenancePlanValidator : AbstractValidator<UpdateMaintenancePlanCommand>
{
    public UpdateMaintenancePlanValidator()
    {
        RuleFor(x => x.PlanId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FrequencyDays)
            .GreaterThan(0)
            .When(x => x.FrequencyDays.HasValue);
    }
}

