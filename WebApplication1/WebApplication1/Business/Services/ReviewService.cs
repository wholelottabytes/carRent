using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<Review> CreateReviewAsync(Review review)
    {
        if (review.Rating < 1 || review.Rating > 5)
            throw new DomainValidationException("Rating must be between 1 and 5.");


        await _reviewRepository.AddAsync(review);
        return review;
    }

    public async Task<IEnumerable<Review>> GetReviewsAsync(Guid rentalLocationId, int page, int pageSize)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;

        return await _reviewRepository.GetByRentalLocationIdAsync(rentalLocationId, page, pageSize);
    }

    public async Task<int> GetReviewsCountAsync(Guid rentalLocationId)
    {
        return await _reviewRepository.GetCountByRentalLocationIdAsync(rentalLocationId);
    }
}