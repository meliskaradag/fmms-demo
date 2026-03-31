using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Locations.Commands.CreateLocation;

public class CreateLocationCommandHandler : IRequestHandler<CreateLocationCommand, Guid>
{
    private readonly IRepository<Location> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateLocationCommandHandler(
        IRepository<Location> repository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var location = new Location
        {
            Name = request.Name,
            Type = request.Type,
            ParentId = request.ParentId,
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(location, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return location.Id;
    }
}
