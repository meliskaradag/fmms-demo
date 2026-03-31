using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Inventory.Commands.CreateStockMovement;
using FMMS.Application.Features.Inventory.Queries.GetStockMovements;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class StockMovementsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<StockMovementDto>>> GetAll(
        [FromQuery] Guid? stockCardId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetStockMovementsQuery(stockCardId, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateStockMovementCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
