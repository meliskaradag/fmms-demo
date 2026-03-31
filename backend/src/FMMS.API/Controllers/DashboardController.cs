using FMMS.Application.DTOs;
using FMMS.Application.Features.Dashboard.Queries.GetDashboard;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class DashboardController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var result = await Mediator.Send(new GetDashboardQuery());
        return Ok(result);
    }
}
