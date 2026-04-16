using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.UpdateAsset;

public class UpdateAssetValidator : AbstractValidator<UpdateAssetCommand>
{
    public UpdateAssetValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AssetTag).MaximumLength(64);
        RuleFor(x => x.AssetNumber).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(128);
        RuleFor(x => x.LocationId).NotEmpty();
        RuleFor(x => x.StockCardId).NotNull().WithMessage("Stock card is required.");
        RuleFor(x => x.Manufacturer).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(128);
        RuleFor(x => x.BatchNumber).NotEmpty().MaximumLength(128);
        RuleFor(x => x.SerialNumber).MaximumLength(128);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Condition).IsInEnum();
        RuleFor(x => x.WarrantyEndDate)
            .GreaterThan(x => x.WarrantyStartDate!.Value)
            .When(x => x.WarrantyStartDate.HasValue && x.WarrantyEndDate.HasValue)
            .WithMessage("Warranty end date must be after warranty start date.");
    }
}
