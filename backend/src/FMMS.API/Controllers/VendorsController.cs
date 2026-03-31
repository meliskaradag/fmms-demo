using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Vendors.Commands.CreateVendor;
using FMMS.Application.Features.Vendors.Queries.GetVendors;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class VendorsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<VendorDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetVendorsQuery(page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateVendorCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
