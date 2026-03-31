using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Vendors.Commands.CreateVendor;

public class CreateVendorCommandHandler : IRequestHandler<CreateVendorCommand, Guid>
{
    private readonly IRepository<Vendor> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateVendorCommandHandler(
        IRepository<Vendor> repository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateVendorCommand request, CancellationToken cancellationToken)
    {
        var vendor = new Vendor
        {
            TradeName = request.Name,
            InvoiceName = request.Code,
            VendorType = request.VendorType,
            ContactPerson = request.ContactPerson,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            TaxNumber = request.TaxNumber,
            ContractStart = request.ContractStart,
            ContractEnd = request.ContractEnd,
            Rating = 0,
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(vendor, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return vendor.Id;
    }
}
