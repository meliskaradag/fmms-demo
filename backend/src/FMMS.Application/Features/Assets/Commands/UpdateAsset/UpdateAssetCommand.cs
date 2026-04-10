using FMMS.Domain.Enums;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.UpdateAsset;

public record UpdateAssetCommand(
    Guid Id,
    string Name,
    string? AssetTag,
    string AssetNumber,
    Guid? ItemId,
    string Category,
    Guid LocationId,
    Guid? DepartmentId,
    Guid? AssignedToUserId,
    Guid? ParentAssetId,
    AssetStatus Status,
    AssetCondition Condition,
    string? Barcode,
    string? QrCode,
    string? NfcTagId,
    DateTime? InstallationDate,
    string BatchNumber,
    string Manufacturer,
    string? Brand,
    string Model,
    string? SerialNumber,
    string? Specifications,
    Guid? StockCardId,
    Guid? SupplierId,
    DateTime? PurchaseDate,
    decimal? PurchaseCost,
    DateTime? WarrantyStartDate,
    DateTime? WarrantyEndDate,
    string? Description,
    string? Notes,
    string? Metadata
) : IRequest;
