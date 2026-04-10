using MediatR;

namespace FMMS.Application.Features.Assets.Commands.TransferAsset;

public record TransferAssetCommand(
    Guid AssetId,
    Guid ToLocationId,
    string? Reason,
    string? Notes
) : IRequest;
