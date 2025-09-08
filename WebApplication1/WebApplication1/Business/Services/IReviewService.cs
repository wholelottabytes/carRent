using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IReviewService
{
    Task<Review> CreateReviewAsync(Review review);
    Task<IEnumerable<ReviewDto>> GetReviewsAsync(Guid rentalLocationId, PaginationParams pagination);
    Task<int> GetReviewsCountAsync(Guid rentalLocationId);
    Task<ReviewDto> UpdateReviewAsync(Guid reviewId, UpdateReviewDto dto, string userId);
}