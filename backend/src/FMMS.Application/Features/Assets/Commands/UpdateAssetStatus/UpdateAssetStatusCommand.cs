using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.UpdateAssetStatus;

public record UpdateAssetStatusCommand(
    Guid AssetId,
    AssetStatus Status,
    string? Note
) : IRequest;
