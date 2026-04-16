using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Assets.Commands.AssignAsset;
using FMMS.Application.Features.Assets.Commands.CreateAsset;
using FMMS.Application.Features.Assets.Commands.TransferAsset;
using FMMS.Application.Features.Assets.Commands.UnassignAsset;
using FMMS.Application.Features.Assets.Commands.UpdateAsset;
using FMMS.Application.Features.Assets.Commands.UpdateAssetStatus;
using FMMS.Application.Features.Assets.Queries.GetAsset;
using FMMS.Application.Features.Assets.Queries.GetAssetHistory;
using FMMS.Application.Features.Assets.Queries.GetAssetMovements;
using FMMS.Application.Features.Assets.Queries.GetAssets;
using FMMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class AssetsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AssetDto>>> GetAll(
        [FromQuery] Guid? locationId,
        [FromQuery] Guid? stockCardId,
        [FromQuery] AssetStatus? status,
        [FromQuery] AssetCondition? condition,
        [FromQuery] bool? assigned,
        [FromQuery] WarrantyState? warrantyState,
        [FromQuery] string? keyword,
        [FromQuery] string? serialNumber,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetAssetsQuery(locationId, stockCardId, page, pageSize, status, condition, assigned, warrantyState, keyword, serialNumber));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AssetDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetAssetQuery(id));
        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateAssetCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateAssetRequest request)
    {
        await Mediator.Send(new UpdateAssetCommand(
            id,
            request.Name,
            request.AssetTag,
            request.AssetNumber,
            request.ItemId,
            request.Category,
            request.LocationId,
            request.DepartmentId,
            request.AssignedToUserId,
            request.ParentAssetId,
            request.Status,
            request.Condition,
            request.Barcode,
            request.QrCode,
            request.NfcTagId,
            request.InstallationDate,
            request.BatchNumber,
            request.Manufacturer,
            request.Brand,
            request.Model,
            request.SerialNumber,
            request.Specifications,
            request.StockCardId,
            request.SupplierId,
            request.PurchaseDate,
            request.PurchaseCost,
            request.WarrantyStartDate,
            request.WarrantyEndDate,
            request.Description,
            request.Notes,
            request.Metadata));

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateAssetStatusRequest request)
    {
        await Mediator.Send(new UpdateAssetStatusCommand(id, request.Status, request.Note));
        return NoContent();
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<ActionResult> Assign(Guid id, [FromBody] AssignAssetRequest request)
    {
        await Mediator.Send(new AssignAssetCommand(id, request.ToUserId, request.Reason, request.Notes));
        return NoContent();
    }

    [HttpPost("{id:guid}/unassign")]
    public async Task<ActionResult> Unassign(Guid id, [FromBody] UnassignAssetRequest request)
    {
        await Mediator.Send(new UnassignAssetCommand(id, request.Reason, request.Notes));
        return NoContent();
    }

    [HttpPost("{id:guid}/transfer")]
    public async Task<ActionResult> Transfer(Guid id, [FromBody] TransferAssetRequest request)
    {
        await Mediator.Send(new TransferAssetCommand(id, request.ToLocationId, request.Reason, request.Notes));
        return NoContent();
    }

    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<List<AssetHistoryDto>>> GetHistory(Guid id)
    {
        var result = await Mediator.Send(new GetAssetHistoryQuery(id));
        return Ok(result);
    }

    [HttpGet("{id:guid}/movements")]
    public async Task<ActionResult<List<AssetMovementDto>>> GetMovements(Guid id)
    {
        var result = await Mediator.Send(new GetAssetMovementsQuery(id));
        return Ok(result);
    }
}

public record UpdateAssetRequest(
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
    string? Metadata);

public record UpdateAssetStatusRequest(AssetStatus Status, string? Note);
public record AssignAssetRequest(Guid ToUserId, string? Reason, string? Notes);
public record UnassignAssetRequest(string? Reason, string? Notes);
public record TransferAssetRequest(Guid ToLocationId, string? Reason, string? Notes);
