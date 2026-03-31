using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.CreateAsset;

public record CreateAssetCommand(
    string Name,
    string AssetNumber,
    string Category,
    Guid LocationId,
    Guid? ParentAssetId,
    AssetStatus Status,
    string? Barcode,
    string? NfcTagId,
    DateTime? InstallationDate,
    string BatchNumber,
    string Manufacturer,
    string Model,
    string? SerialNumber,
    Guid? StockCardId,
    string? Metadata
) : IRequest<Guid>;
