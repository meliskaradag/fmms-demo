using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Application.Features.FaultReports.Commands.AddFaultReportPhoto;
using FMMS.Application.Features.FaultReports.Commands.CreateFaultReport;
using FMMS.Application.Features.FaultReports.Commands.CreateWorkOrderFromFaultReport;
using FMMS.Application.Features.FaultReports.Commands.ReviewFaultReport;
using FMMS.Application.Features.FaultReports.Queries.GetFaultReport;
using FMMS.Application.Features.FaultReports.Queries.GetFaultReports;
using FMMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

[Route("api/v1/t/{tenantSlug}/fault-reports")]
public class FaultReportsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<FaultReportDto>>> GetAll(
        [FromQuery] FaultReportStatus? status,
        [FromQuery] Guid? reportedBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetFaultReportsQuery(status, reportedBy, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FaultReportDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetFaultReportQuery(id));
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateFaultReportCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }

    [HttpPost("{id:guid}/photos")]
    public async Task<ActionResult<Guid>> AddPhoto(Guid id, [FromBody] AddPhotoRequest request)
    {
        var cmd = new AddFaultReportPhotoCommand
        {
            FaultReportId = id,
            FileName = request.FileName,
            ContentType = request.ContentType,
            Base64Data = request.Base64Data,
            GpsLat = request.GpsLat,
            GpsLng = request.GpsLng
        };
        var photoId = await Mediator.Send(cmd);
        return Ok(photoId);
    }

    [HttpPut("{id:guid}/review")]
    public async Task<ActionResult> Review(Guid id, [FromBody] ReviewRequest request)
    {
        var cmd = new ReviewFaultReportCommand
        {
            FaultReportId = id,
            NewStatus = request.NewStatus,
            ReviewedBy = request.ReviewedBy,
            ReviewNote = request.ReviewNote
        };
        await Mediator.Send(cmd);
        return NoContent();
    }

    [HttpPost("{id:guid}/create-work-order")]
    public async Task<ActionResult<Guid>> CreateWorkOrder(Guid id, [FromBody] CreateWorkOrderRequest request)
    {
        var cmd = new CreateWorkOrderFromFaultReportCommand
        {
            FaultReportId = id,
            ReviewedBy = request.ReviewedBy
        };
        var workOrderId = await Mediator.Send(cmd);
        return Ok(workOrderId);
    }
}

// Request DTOs
public record AddPhotoRequest(string FileName, string ContentType, string Base64Data, decimal GpsLat = 0, decimal GpsLng = 0);
public record ReviewRequest(FaultReportStatus NewStatus, Guid ReviewedBy, string? ReviewNote);
public record CreateWorkOrderRequest(Guid ReviewedBy);
