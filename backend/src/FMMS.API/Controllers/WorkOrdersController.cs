using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.WorkOrders.Commands.AssignWorkOrder;
using FMMS.Application.Features.WorkOrders.Commands.CreateWorkOrder;
using FMMS.Application.Features.WorkOrders.Commands.RequestPhotoUpload;
using FMMS.Application.Features.WorkOrders.Commands.UpdateWorkOrderStatus;
using FMMS.Application.Features.WorkOrders.Queries.GetWorkOrder;
using FMMS.Application.Features.WorkOrders.Queries.GetWorkOrders;
using FMMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

public class WorkOrdersController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<WorkOrderDto>>> GetAll(
        [FromQuery] WorkOrderStatus? status,
        [FromQuery] Priority? priority,
        [FromQuery] Guid? locationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetWorkOrdersQuery(status, priority, locationId, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkOrderDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetWorkOrderQuery(id));
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateWorkOrderCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<ActionResult<Guid>> Assign(Guid id, [FromBody] AssignWorkOrderRequest request)
    {
        var assigneeId = await Mediator.Send(new AssignWorkOrderCommand(id, request.UserId, request.Role ?? "technician"));
        return Ok(assigneeId);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        await Mediator.Send(new UpdateWorkOrderStatusCommand(id, request.NewStatus));
        return NoContent();
    }

    [HttpPost("{id:guid}/photos/upload-url")]
    public async Task<ActionResult<PresignedUrlDto>> RequestPhotoUpload(Guid id, [FromBody] PhotoUploadRequest request)
    {
        var result = await Mediator.Send(new RequestPhotoUploadCommand(
            id, request.PhotoType, request.FileName, request.ContentType, request.GpsLat, request.GpsLng));
        return Ok(result);
    }
}

// Request DTOs for controller bindings
public record AssignWorkOrderRequest(Guid UserId, string? Role);
public record UpdateStatusRequest(WorkOrderStatus NewStatus);
public record PhotoUploadRequest(PhotoType PhotoType, string FileName, string ContentType, decimal GpsLat = 0, decimal GpsLng = 0);
