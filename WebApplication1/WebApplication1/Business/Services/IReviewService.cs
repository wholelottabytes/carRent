using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IReviewService
{
    Task<Review> CreateReviewAsync(Review review);
    Task<IEnumerable<Review>> GetReviewsAsync(Guid rentalLocationId, int page, int pageSize);
    Task<int> GetReviewsCountAsync(Guid rentalLocationId);
}