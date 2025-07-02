using WebApplication1.Common.DTOs;
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
    public async Task<Review> UpdateReviewAsync(Guid reviewId, UpdateReviewDto dto, string userId)
    {
        var existingReview = await _reviewRepository.GetByIdAsync(reviewId)
                             ?? throw new EntityNotFoundException(nameof(Review), reviewId);

        if (existingReview.UserId != userId)
            throw new UnauthorizedAccessException("You can edit only your own reviews.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new DomainValidationException("Rating must be between 1 and 5.");

        existingReview.Rating = dto.Rating;
        existingReview.Comment = dto.Comment;
        existingReview.CreatedAt = DateTime.UtcNow;

        await _reviewRepository.UpdateAsync(existingReview);
        return existingReview;
    }
    public async Task<Review> CreateReviewAsync(Review review)
    {
        if (review.Rating < 1 || review.Rating > 5)
            throw new DomainValidationException("Rating must be between 1 and 5.");

        var existingReview = await _reviewRepository.GetByUserAndRentalLocationAsync(review.UserId, review.RentalLocationId);
        if (existingReview != null)
            throw new ConflictException("User has already left a review for this rental location.");

        await _reviewRepository.AddAsync(review);
        return review;
    }
    public async Task<IEnumerable<Review>> GetReviewsAsync(Guid rentalLocationId, PaginationParams pagination)
    {
        return await _reviewRepository.GetByRentalLocationIdAsync(rentalLocationId, pagination.Page, pagination.PageSize);
    }

    public async Task<int> GetReviewsCountAsync(Guid rentalLocationId)
    {
        return await _reviewRepository.GetCountByRentalLocationIdAsync(rentalLocationId);
    }
}