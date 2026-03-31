using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.Assets.Commands.CreateAsset;
using FMMS.Application.Features.Assets.Queries.GetAssets;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class AssetsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AssetDto>>> GetAll(
        [FromQuery] Guid? locationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetAssetsQuery(locationId, page, pageSize));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateAssetCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}
