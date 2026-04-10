using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Inventory.Commands.CreateStockCard;
using FMMS.Application.Features.Inventory.Commands.CreateStockVariant;
using FMMS.Application.Features.Inventory.Commands.BulkGenerateStockVariants;
using FMMS.Application.Features.Inventory.Commands.AttachStockCardAttributes;
using FMMS.Application.Features.Inventory.Commands.GenerateVariantBarcode;
using FMMS.Application.Features.Inventory.Commands.UpdateStockCard;
using FMMS.Application.Features.Inventory.Queries.GetLowStock;
using FMMS.Application.Features.Inventory.Queries.GetStockCard;
using FMMS.Application.Features.Inventory.Queries.GetStockCardTree;
using FMMS.Application.Features.Inventory.Queries.GetStockCards;
using FMMS.Application.Features.Inventory.Queries.GetStockVariants;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class StockCardsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<StockCardDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetStockCardsQuery(search, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StockCardDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetStockCardQuery(id));
        if (result is null)
            return NotFound();
        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<List<StockCardDto>>> GetLowStock()
    {
        var result = await Mediator.Send(new GetLowStockQuery());
        return Ok(result);
    }

    [HttpGet("tree")]
    public async Task<ActionResult<List<StockCardTreeNodeDto>>> GetTree()
    {
        var result = await Mediator.Send(new GetStockCardTreeQuery());
        return Ok(result);
    }

    [HttpGet("{id:guid}/variants")]
    public async Task<ActionResult<List<StockVariantDto>>> GetVariants(Guid id)
    {
        var result = await Mediator.Send(new GetStockVariantsQuery(id));
        return Ok(result);
    }

    [HttpPost("{id:guid}/variants")]
    public async Task<ActionResult<Guid>> CreateVariant(Guid id, [FromBody] CreateStockVariantRequest request)
    {
        var variantId = await Mediator.Send(new CreateStockVariantCommand(
            id,
            request.Code,
            request.Sku,
            request.Barcode,
            request.Name,
            request.PriceAdjustment,
            request.PurchasePriceOverride,
            request.SalesPriceOverride,
            request.Attributes.Select(x => new VariantAttributeSelection(x.StockAttributeId, x.StockAttributeOptionId)).ToList()
        ));

        return Ok(variantId);
    }

    [HttpPost("{id:guid}/variants/bulk")]
    public async Task<ActionResult<List<Guid>>> BulkCreateVariants(Guid id, [FromBody] BulkCreateStockVariantRequest request)
    {
        var ids = await Mediator.Send(new BulkGenerateStockVariantsCommand(
            id,
            request.Variants.Select(x => new BulkVariantTemplate(
                x.Code,
                x.Sku,
                x.Barcode,
                x.Name,
                x.PriceAdjustment,
                x.PurchasePriceOverride,
                x.SalesPriceOverride,
                x.Attributes.Select(a => new AttributesSelection(a.StockAttributeId, a.StockAttributeOptionId)).ToList()
            )).ToList()
        ));

        return Ok(ids);
    }

    [HttpPost("{id:guid}/attributes")]
    public async Task<ActionResult> AttachAttributes(Guid id, [FromBody] AttachStockCardAttributesRequest request)
    {
        await Mediator.Send(new AttachStockCardAttributesCommand(
            id,
            request.Attributes.Select(x => new AttachAttributeInput(x.StockAttributeId, x.IsRequired, x.SortOrder)).ToList()
        ));
        return NoContent();
    }

    [HttpPost("variants/{variantId:guid}/generate-barcode")]
    public async Task<ActionResult<string>> GenerateVariantBarcode(Guid variantId)
    {
        var barcode = await Mediator.Send(new GenerateVariantBarcodeCommand(variantId));
        return Ok(barcode);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateStockCardCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateStockCardRequest request)
    {
        await Mediator.Send(new UpdateStockCardCommand(
            id,
            request.StockNumber,
            request.Name,
            request.Category,
            request.Unit,
            request.MinStockLevel,
            request.Barcode,
            request.Sku,
            request.MaxStockLevel,
            request.CriticalStockLevel,
            request.IsVariantBased,
            request.IsActive,
            request.NodeType,
            request.Description));

        return NoContent();
    }

    public record UpdateStockCardRequest(
        string StockNumber,
        string Name,
        string Category,
        string Unit,
        decimal MinStockLevel,
        string? Barcode,
        string? Sku,
        decimal? MaxStockLevel,
        decimal? CriticalStockLevel,
        bool? IsVariantBased,
        bool? IsActive,
        FMMS.Domain.Enums.StockNodeType? NodeType,
        string? Description);

    public record CreateStockVariantRequest(
        string Code,
        string? Sku,
        string? Barcode,
        string? Name,
        decimal PriceAdjustment,
        decimal? PurchasePriceOverride,
        decimal? SalesPriceOverride,
        List<VariantAttributeRequest> Attributes);

    public record VariantAttributeRequest(Guid StockAttributeId, Guid StockAttributeOptionId);

    public record BulkCreateStockVariantRequest(List<CreateStockVariantRequest> Variants);

    public record AttachStockCardAttributesRequest(List<AttachStockCardAttributeRequest> Attributes);

    public record AttachStockCardAttributeRequest(Guid StockAttributeId, bool IsRequired, int SortOrder);
}
