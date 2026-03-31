using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Maintenance.Commands.CreateMaintenanceCard;
using FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCard;
using FMMS.Application.Features.Maintenance.Queries.GetMaintenanceCards;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class MaintenanceCardsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<MaintenanceCardDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetMaintenanceCardsQuery(page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MaintenanceCardDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetMaintenanceCardQuery(id));
        if (result is null)
            return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateMaintenanceCardCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
