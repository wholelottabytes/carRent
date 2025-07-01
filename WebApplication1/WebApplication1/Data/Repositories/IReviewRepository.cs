using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public interface IReviewRepository
{
    Task AddAsync(Review review);
    Task<IEnumerable<Review>> GetByRentalLocationIdAsync(Guid rentalLocationId, int page, int pageSize);
    Task<int> GetCountByRentalLocationIdAsync(Guid rentalLocationId);
    Task<Review?> GetByUserAndRentalLocationAsync(string userId, Guid rentalLocationId);
    Task UpdateAsync(Review review);

    Task<Review?> GetByIdAsync(Guid id);

}
