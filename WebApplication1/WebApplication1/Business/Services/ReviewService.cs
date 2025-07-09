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

    public async Task<ReviewDto> UpdateReviewAsync(Guid reviewId, UpdateReviewDto dto, string userId)
    {
        var existingReview = await _reviewRepository.GetByIdAsync(reviewId)
                             ?? throw new EntityNotFoundException(nameof(Review), reviewId);

        if (existingReview.UserId != userId)
            throw new UnauthorizedAccessException("You can edit only your own reviews.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new DomainValidationException("Rating must be between 1 and 5.");

        existingReview.Rating = dto.Rating;
        existingReview.Comment = dto.Comment;

        await _reviewRepository.UpdateAsync(existingReview);

        return new ReviewDto
        {
            Id = existingReview.Id,
            Rating = existingReview.Rating,
            Comment = existingReview.Comment,
            CreatedAt = existingReview.CreatedAt,
            UserId = existingReview.UserId,
            UserName = existingReview.User?.UserName ?? "Unknown"
        };
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

    public async Task<IEnumerable<ReviewDto>> GetReviewsAsync(Guid rentalLocationId, PaginationParams pagination)
    {
        var reviews = await _reviewRepository.GetByRentalLocationIdAsync(rentalLocationId, pagination.Page, pagination.PageSize);

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt,
            UserId = r.UserId,
            UserName = r.User?.UserName ?? "Unknown"
        });
    }

    public async Task<int> GetReviewsCountAsync(Guid rentalLocationId)
    {
        return await _reviewRepository.GetCountByRentalLocationIdAsync(rentalLocationId);
    }
}
