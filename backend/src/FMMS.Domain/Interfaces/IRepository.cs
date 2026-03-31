using FMMS.Domain.Common;

namespace FMMS.Domain.Interfaces;

public interface IRepository<T> where T : AuditableEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Delete(T entity);
    IQueryable<T> GetQueryable();
}
