using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.MaintenancePlans.Commands.CreateMaintenancePlan;
using FMMS.Application.Features.MaintenancePlans.Commands.RunMaintenancePlannerNow;
using FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlan;
using FMMS.Application.Features.MaintenancePlans.Commands.UpdateMaintenancePlanMeter;
using FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlans;
using FMMS.Application.Features.MaintenancePlans.Queries.GetMaintenancePlanRuns;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class MaintenancePlansController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<MaintenancePlanDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isActive = null)
    {
        var result = await Mediator.Send(new GetMaintenancePlansQuery(page, pageSize, isActive));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateMaintenancePlanCommand command)
    {
        var id = await Mediator.Send(command);
        return Created($"/api/maintenanceplans/{id}", id);
    }

    [HttpGet("runs")]
    public async Task<ActionResult<PagedResult<MaintenancePlanRunDto>>> GetRuns(
        [FromQuery] Guid? planId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetMaintenancePlanRunsQuery(planId, page, pageSize));
        return Ok(result);
    }

    [HttpPut("{id:guid}/meter")]
    public async Task<IActionResult> UpdateMeter(Guid id, [FromBody] UpdateMeterRequest request)
    {
        await Mediator.Send(new UpdateMaintenancePlanMeterCommand(id, request.CurrentMeterReading));
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMaintenancePlanRequest request)
    {
        await Mediator.Send(new UpdateMaintenancePlanCommand(
            id,
            request.Name,
            request.FirstDueAt,
            request.FrequencyDays,
            request.Priority,
            request.IsActive
        ));
        return NoContent();
    }

    [HttpPost("run-now")]
    public async Task<IActionResult> RunNow()
    {
        var result = await Mediator.Send(new RunMaintenancePlannerNowCommand());
        return Ok(result);
    }
}

public record UpdateMeterRequest(decimal CurrentMeterReading);
public record UpdateMaintenancePlanRequest(
    string Name,
    DateTime? FirstDueAt,
    int? FrequencyDays,
    FMMS.Domain.Enums.Priority Priority,
    bool IsActive
);
