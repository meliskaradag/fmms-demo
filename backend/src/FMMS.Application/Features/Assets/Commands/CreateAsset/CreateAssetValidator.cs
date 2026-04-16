using FluentValidation;
using FMMS.Domain.Enums;

namespace FMMS.Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetValidator : AbstractValidator<CreateAssetCommand>
{
    public CreateAssetValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200);

        RuleFor(x => x.AssetTag)
            .MaximumLength(64);

        RuleFor(x => x.AssetNumber)
            .NotEmpty().WithMessage("Asset number is required.")
            .MaximumLength(64);

        RuleFor(x => x.SerialNumber)
            .MaximumLength(128);

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(128);

        RuleFor(x => x.LocationId)
            .NotEmpty().WithMessage("Location is required.");

        RuleFor(x => x.StockCardId)
            .NotNull().WithMessage("Stock card is required.")
            .NotEmpty().WithMessage("Stock card is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status value is invalid.");

        RuleFor(x => x.Condition)
            .Must(x => x is null || Enum.IsDefined(typeof(AssetCondition), x.Value))
            .WithMessage("Condition value is invalid.");

        RuleFor(x => x.Manufacturer)
            .NotEmpty().WithMessage("Manufacturer is required.")
            .MaximumLength(128);

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Model is required.")
            .MaximumLength(128);

        RuleFor(x => x.BatchNumber)
            .NotEmpty().WithMessage("Batch number is required.")
            .MaximumLength(128);

        RuleFor(x => x.WarrantyEndDate)
            .GreaterThan(x => x.WarrantyStartDate!.Value)
            .When(x => x.WarrantyStartDate.HasValue && x.WarrantyEndDate.HasValue)
            .WithMessage("Warranty end date must be after warranty start date.");
    }
}
