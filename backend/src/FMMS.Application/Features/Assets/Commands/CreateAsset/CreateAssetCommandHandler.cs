using FMMS.Domain.Entities;
using FMMS.Domain.Interfaces;
using MediatR;

namespace FMMS.Application.Features.Assets.Commands.CreateAsset;

public class CreateAssetCommandHandler : IRequestHandler<CreateAssetCommand, Guid>
{
    private readonly IRepository<Asset> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContext _tenantContext;

    public CreateAssetCommandHandler(
        IRepository<Asset> repository,
        IUnitOfWork unitOfWork,
        ITenantContext tenantContext)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _tenantContext = tenantContext;
    }

    public async Task<Guid> Handle(CreateAssetCommand request, CancellationToken cancellationToken)
    {
        var asset = new Asset
        {
            Name = request.Name,
            AssetNumber = request.AssetNumber,
            Category = request.Category,
            LocationId = request.LocationId,
            ParentAssetId = request.ParentAssetId,
            Status = request.Status,
            Barcode = request.Barcode,
            NfcTagId = request.NfcTagId,
            InstallationDate = request.InstallationDate,
            BatchNumber = request.BatchNumber,
            Manufacturer = request.Manufacturer,
            Model = request.Model,
            SerialNumber = request.SerialNumber,
            StockCardId = request.StockCardId,
            Metadata = request.Metadata,
            TenantId = _tenantContext.TenantId
        };

        await _repository.AddAsync(asset, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return asset.Id;
    }
}
