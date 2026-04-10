using FluentValidation;

namespace FMMS.Application.Features.Assets.Commands.TransferAsset;

public class TransferAssetValidator : AbstractValidator<TransferAssetCommand>
{
    public TransferAssetValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty();
        RuleFor(x => x.ToLocationId).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}
