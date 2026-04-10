using FMMS.Domain.Enums;
using FluentValidation;

namespace FMMS.Application.Features.MaintenancePlans.Commands.CreateMaintenancePlan;

public class CreateMaintenancePlanValidator : AbstractValidator<CreateMaintenancePlanCommand>
{
    public CreateMaintenancePlanValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MaintenanceCardId).NotEmpty();
        RuleFor(x => x.AssetId).NotEmpty();

        RuleFor(x => x.FrequencyDays)
            .GreaterThan(0)
            .When(x => x.TriggerType is MaintenancePlanTriggerType.TimeBased or MaintenancePlanTriggerType.Hybrid);

        RuleFor(x => x.FirstDueAt)
            .NotNull()
            .When(x => x.TriggerType is MaintenancePlanTriggerType.TimeBased or MaintenancePlanTriggerType.Hybrid);

        RuleFor(x => x.MeterInterval)
            .GreaterThan(0)
            .When(x => x.TriggerType is MaintenancePlanTriggerType.MeterBased or MaintenancePlanTriggerType.Hybrid);
    }
}
