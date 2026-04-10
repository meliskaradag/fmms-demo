using FMMS.Application.Features.Assets.Commands.AssignAsset;
using FMMS.Application.Features.Assets.Commands.TransferAsset;
using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using Xunit;

namespace FMMS.Application.Tests;

public class AssetCommandRulesTests
{
    [Fact]
    public async Task Assign_ShouldThrow_ForDisposedAsset()
    {
        var tenant = new FakeTenantContext();
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            Name = "Disposed",
            AssetTag = "A-1",
            AssetNumber = "A-1",
            Category = "Cat",
            LocationId = Guid.NewGuid(),
            Manufacturer = "M",
            Model = "Model",
            BatchNumber = "B",
            TenantId = tenant.TenantId,
            Status = AssetStatus.Disposed
        };

        var assetRepo = new InMemoryRepository<Asset>(new List<Asset> { asset });
        var service = new AssetLifecycleService(
            new InMemoryRepository<AssetHistory>(),
            new InMemoryRepository<AssetMovement>(),
            assetRepo,
            new FakeCurrentUserContext(),
            tenant);

        var handler = new AssignAssetCommandHandler(assetRepo, new FakeUnitOfWork(), service, tenant);
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(new AssignAssetCommand(asset.Id, Guid.NewGuid(), null, null), CancellationToken.None));
    }

    [Fact]
    public async Task Transfer_ShouldThrow_ForSameLocation()
    {
        var tenant = new FakeTenantContext();
        var locationId = Guid.NewGuid();
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            Name = "Asset",
            AssetTag = "A-2",
            AssetNumber = "A-2",
            Category = "Cat",
            LocationId = locationId,
            Manufacturer = "M",
            Model = "Model",
            BatchNumber = "B",
            TenantId = tenant.TenantId,
            Status = AssetStatus.Active
        };
        var location = new Location { Id = locationId, Name = "Loc", Type = LocationType.Building, TenantId = tenant.TenantId };

        var assetRepo = new InMemoryRepository<Asset>(new List<Asset> { asset });
        var locationRepo = new InMemoryRepository<Location>(new List<Location> { location });
        var service = new AssetLifecycleService(
            new InMemoryRepository<AssetHistory>(),
            new InMemoryRepository<AssetMovement>(),
            assetRepo,
            new FakeCurrentUserContext(),
            tenant);

        var handler = new TransferAssetCommandHandler(assetRepo, locationRepo, new FakeUnitOfWork(), service, tenant);
        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(new TransferAssetCommand(asset.Id, locationId, null, null), CancellationToken.None));
    }
}
