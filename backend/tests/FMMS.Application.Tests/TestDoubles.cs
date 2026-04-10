using FMMS.Domain.Common;
using FMMS.Domain.Interfaces;

namespace FMMS.Application.Tests;

internal class InMemoryRepository<T> : IRepository<T> where T : AuditableEntity
{
    private readonly List<T> _items;

    public InMemoryRepository(List<T>? seed = null)
    {
        _items = seed ?? new List<T>();
    }

    public Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Task.FromResult(_items.FirstOrDefault(x => x.Id == id));

    public Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(_items.ToList());

    public Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        _items.Add(entity);
        return Task.CompletedTask;
    }

    public void Update(T entity)
    {
        var idx = _items.FindIndex(x => x.Id == entity.Id);
        if (idx >= 0) _items[idx] = entity;
    }

    public void Delete(T entity)
    {
        entity.IsDeleted = true;
    }

    public IQueryable<T> GetQueryable() => _items.AsQueryable();
}

internal class FakeUnitOfWork : IUnitOfWork
{
    public Task BeginTransactionAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => Task.FromResult(1);
}

internal class FakeCurrentUserContext : ICurrentUserContext
{
    public Guid UserId { get; set; } = Guid.Parse("00000000-0000-0000-0000-000000000123");
    public string Email { get; set; } = "test@example.com";
    public string FullName { get; set; } = "Test User";
    public string Role { get; set; } = "tester";
    public string IpAddress { get; set; } = "127.0.0.1";
}

internal class FakeTenantContext : ITenantContext
{
    public Guid TenantId { get; set; } = Guid.Parse("00000000-0000-0000-0000-000000000999");
    public string TenantSlug { get; set; } = "test";
    public string SchemaName { get; set; } = "public";
}
