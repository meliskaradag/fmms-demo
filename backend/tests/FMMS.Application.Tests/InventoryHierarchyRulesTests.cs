using FMMS.Application.Features.Inventory.Commands.BulkGenerateStockVariants;
using FMMS.Application.Features.Inventory.Commands.CreateStockCard;
using FMMS.Application.Features.Inventory.Commands.CreateStockMovement;
using FMMS.Application.Features.Inventory.Commands.CreateStockVariant;
using FMMS.Domain.Entities;
using FMMS.Domain.Enums;
using MediatR;
using Xunit;

namespace FMMS.Application.Tests;

public class InventoryHierarchyRulesTests
{
    [Fact]
    public async Task CreateStockCard_ShouldBlockInvalidParentChildCombination()
    {
        var tenant = new FakeTenantContext();
        var cardRepo = new InMemoryRepository<StockCard>(new List<StockCard>
        {
            new()
            {
                Id = Guid.NewGuid(),
                StockNumber = "GRP-01",
                Name = "Group",
                Category = "Catalog",
                Unit = "adet",
                MinStockLevel = 0,
                NodeType = StockNodeType.StockGroup,
                TenantId = tenant.TenantId
            }
        });

        var handler = new CreateStockCardCommandHandler(
            cardRepo,
            new InMemoryRepository<StockBalance>(),
            new InMemoryRepository<StockMovement>(),
            new InMemoryRepository<Location>(new List<Location> { new() { Id = Guid.NewGuid(), Name = "Main", Type = LocationType.Warehouse, TenantId = tenant.TenantId } }),
            new FakeUnitOfWork(),
            tenant,
            new FakeCurrentUserContext());

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new CreateStockCardCommand(
                "CARD-001",
                "Invalid Child",
                "Cat",
                "adet",
                0,
                0,
                cardRepo.GetQueryable().First().Id,
                StockNodeType.StockCard), CancellationToken.None));
    }

    [Fact]
    public async Task CreateStockVariant_ShouldBlockDuplicateAttributeCombination()
    {
        var tenant = new FakeTenantContext();
        var stockCardId = Guid.NewGuid();
        var attrId = Guid.NewGuid();
        var optionId = Guid.NewGuid();

        var cardRepo = new InMemoryRepository<StockCard>(new List<StockCard>
        {
            new()
            {
                Id = stockCardId,
                StockNumber = "CARD-001",
                Name = "Demo Card",
                Category = "Cat",
                Unit = "adet",
                MinStockLevel = 0,
                NodeType = StockNodeType.StockCard,
                TenantId = tenant.TenantId
            }
        });

        var variantRepo = new InMemoryRepository<StockVariant>(new List<StockVariant>
        {
            new()
            {
                Id = Guid.NewGuid(),
                StockCardId = stockCardId,
                Code = "V-001",
                Name = "Demo V1",
                VariantKey = $"{attrId:N}:{optionId:N}",
                TenantId = tenant.TenantId
            }
        });

        var handler = new CreateStockVariantCommandHandler(
            cardRepo,
            variantRepo,
            new InMemoryRepository<StockAttributeOption>(new List<StockAttributeOption>
            {
                new() { Id = optionId, StockAttributeId = attrId, Code = "BLUE", Value = "Blue", DisplayValue = "Blue", TenantId = tenant.TenantId }
            }),
            new InMemoryRepository<StockVariantAttributeValue>(),
            new FakeUnitOfWork(),
            tenant);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new CreateStockVariantCommand(
                stockCardId,
                "V-002",
                null,
                null,
                null,
                0,
                null,
                null,
                new List<VariantAttributeSelection> { new(attrId, optionId) }), CancellationToken.None));
    }

    [Fact]
    public async Task CreateStockMovement_ShouldRequireVariant_WhenStockCardIsVariantBased()
    {
        var tenant = new FakeTenantContext();
        var locationId = Guid.NewGuid();
        var stockCardId = Guid.NewGuid();
        var cardRepo = new InMemoryRepository<StockCard>(new List<StockCard>
        {
            new()
            {
                Id = stockCardId,
                StockNumber = "CARD-001",
                Name = "Variant Card",
                Category = "Cat",
                Unit = "adet",
                MinStockLevel = 0,
                NodeType = StockNodeType.StockCard,
                IsVariantBased = true,
                TenantId = tenant.TenantId
            }
        });

        var handler = new CreateStockMovementCommandHandler(
            new InMemoryRepository<StockMovement>(),
            new InMemoryRepository<StockBalance>(),
            cardRepo,
            new InMemoryRepository<StockVariant>(),
            new InMemoryRepository<Location>(new List<Location> { new() { Id = locationId, Name = "Main", Type = LocationType.Warehouse, TenantId = tenant.TenantId } }),
            new FakeUnitOfWork(),
            tenant,
            new FakeCurrentUserContext());

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new CreateStockMovementCommand(
                stockCardId,
                null,
                MovementType.In,
                10,
                toLocationId: locationId), CancellationToken.None));
    }

    [Fact]
    public async Task BulkGenerateVariants_ShouldCreateAllVariants()
    {
        var mediator = new StubMediator();
        var handler = new BulkGenerateStockVariantsCommandHandler(mediator);
        var stockCardId = Guid.NewGuid();

        var ids = await handler.Handle(new BulkGenerateStockVariantsCommand(
            stockCardId,
            new List<BulkVariantTemplate>
            {
                new("V-01", null, null, "Variant 1", 0, null, null, new()),
                new("V-02", null, null, "Variant 2", 0, null, null, new())
            }), CancellationToken.None);

        Assert.Equal(2, ids.Count);
    }

    private sealed class StubMediator : IMediator
    {
        public Task Publish(object notification, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default) where TNotification : INotification => Task.CompletedTask;
        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
            => Task.FromResult((TResponse)(object)Guid.NewGuid());
        public Task<object?> Send(object request, CancellationToken cancellationToken = default)
            => Task.FromResult<object?>(Guid.NewGuid());
        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
            => AsyncEnumerable.Empty<TResponse>();
        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
            => AsyncEnumerable.Empty<object?>();
    }
}
