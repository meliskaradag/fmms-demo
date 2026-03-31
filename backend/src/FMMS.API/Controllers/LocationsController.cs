using FMMS.Application.DTOs;
using FMMS.Application.Features.Locations.Commands.CreateLocation;
using FMMS.Application.Features.Locations.Queries.GetLocationTree;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class LocationsController : BaseApiController
{
    [HttpGet("tree")]
    public async Task<ActionResult<List<LocationDto>>> GetTree()
    {
        var result = await Mediator.Send(new GetLocationTreeQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateLocationCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
