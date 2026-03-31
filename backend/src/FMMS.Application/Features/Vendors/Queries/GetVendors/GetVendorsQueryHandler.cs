using FMMS.Application.Common;
using FMMS.Application.DTOs;
using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Vendors.Queries.GetVendors;

public class GetVendorsQueryHandler : IRequestHandler<GetVendorsQuery, PagedResult<VendorDto>>
{
    private readonly IRepository<Vendor> _repository;

    public GetVendorsQueryHandler(IRepository<Vendor> repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<VendorDto>> Handle(GetVendorsQuery request, CancellationToken cancellationToken)
    {
        var allVendors = await _repository.GetAllAsync(cancellationToken);

        var ordered = allVendors.OrderByDescending(v => v.CreatedAt).ToList();
        var total = ordered.Count;

        var items = ordered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(v => new VendorDto
            {
                Id = v.Id,
                Name = v.TradeName,
                Code = v.InvoiceName,
                VendorType = v.VendorType,
                ContactPerson = v.ContactPerson,
                Phone = v.Phone,
                Email = v.Email,
                Address = v.Address,
                IsActive = !v.IsDeleted,
                CreatedAt = v.CreatedAt
            }).ToList();

        return new PagedResult<VendorDto>
        {
            Items = items,
            Page = request.Page,
            PageSize = request.PageSize,
            Total = total
        };
    }
}
