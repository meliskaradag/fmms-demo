using FMMS.Application.Features.Assets.Services;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using Xunit;

namespace FMMS.Application.Tests;

public class AssetLifecycleServiceTests
{
    [Fact]
    public void GetWarrantyState_ShouldReturnExpired()
    {
        var service = CreateService();
        var result = service.GetWarrantyState(DateTime.UtcNow.Date.AddDays(-1));
        Assert.Equal(WarrantyState.Expired, result);
    }

    [Fact]
    public void GetWarrantyState_ShouldReturnExpiringSoon()
    {
        var service = CreateService();
        var result = service.GetWarrantyState(DateTime.UtcNow.Date.AddDays(10));
        Assert.Equal(WarrantyState.ExpiringSoon, result);
    }

    [Fact]
    public async Task EnsureParentRelationIsValid_ShouldThrowOnCircularRelation()
    {
        var tenant = new FakeTenantContext();
        var parent = new Asset { Id = Guid.NewGuid(), Name = "P", AssetTag = "P", AssetNumber = "P", Category = "C", LocationId = Guid.NewGuid(), Manufacturer = "M", Model = "X", BatchNumber = "B", TenantId = tenant.TenantId, ParentAssetId = Guid.NewGuid() };
        var child = new Asset { Id = parent.ParentAssetId.Value, Name = "C", AssetTag = "C", AssetNumber = "C", Category = "C", LocationId = Guid.NewGuid(), Manufacturer = "M", Model = "X", BatchNumber = "B", TenantId = tenant.TenantId, ParentAssetId = parent.Id };

        var assetRepo = new InMemoryRepository<Asset>(new List<Asset> { parent, child });
        var service = new AssetLifecycleService(
            new InMemoryRepository<AssetHistory>(),
            new InMemoryRepository<AssetMovement>(),
            assetRepo,
            new FakeCurrentUserContext(),
            tenant);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.EnsureParentRelationIsValidAsync(parent.Id, child.Id, CancellationToken.None));
    }

    private static AssetLifecycleService CreateService()
    {
        return new AssetLifecycleService(
            new InMemoryRepository<AssetHistory>(),
            new InMemoryRepository<AssetMovement>(),
            new InMemoryRepository<Asset>(),
            new FakeCurrentUserContext(),
            new FakeTenantContext());
    }
}
