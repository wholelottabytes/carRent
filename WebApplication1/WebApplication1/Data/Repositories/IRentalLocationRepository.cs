using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public interface IRentalLocationRepository
{
    Task<RentalLocation> GetByIdAsync(Guid id);
    Task<IEnumerable<RentalLocation>> ListAsync();
    Task AddAsync(RentalLocation loc);
    Task UpdateAsync(RentalLocation loc);
    Task SoftDeleteAsync(RentalLocation loc);
}
