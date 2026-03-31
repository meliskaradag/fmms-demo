using FMMS.Application.Common;
using FMMS.Application.DTOs;
using MediatR;

namespace FMMS.Application.Features.Vendors.Queries.GetVendors;

public record GetVendorsQuery(
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<VendorDto>>;
