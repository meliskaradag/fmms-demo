using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.ServiceAgreements.Commands.CreateServiceAgreement;
using FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreement;
using FMMS.Application.Features.ServiceAgreements.Queries.GetServiceAgreements;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class ServiceAgreementsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ServiceAgreementDto>>> GetAll(
        [FromQuery] Guid? vendorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetServiceAgreementsQuery(vendorId, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ServiceAgreementDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetServiceAgreementQuery(id));
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateServiceAgreementCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
