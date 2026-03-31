using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Inventory.Commands.CreateStockCard;
using FMMS.Application.Features.Inventory.Queries.GetLowStock;
using FMMS.Application.Features.Inventory.Queries.GetStockCard;
using FMMS.Application.Features.Inventory.Queries.GetStockCards;
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

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateStockCardCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
