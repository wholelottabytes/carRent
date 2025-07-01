namespace WebApplication1.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Business.Services;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var review = new Review
        {
            RentalLocationId = dto.RentalLocationId,
            UserId = User.Identity?.Name ?? throw new UnauthorizedAccessException(),
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        var createdReview = await _reviewService.CreateReviewAsync(review);
        return CreatedAtAction(nameof(GetByRentalLocation), new { rentalLocationId = createdReview.RentalLocationId }, createdReview);
    }

    [HttpGet("{rentalLocationId}")]
    public async Task<IActionResult> GetByRentalLocation(Guid rentalLocationId, [FromQuery] PaginationParams pagination)
    {
        var reviews = await _reviewService.GetReviewsAsync(rentalLocationId, pagination);
        var totalCount = await _reviewService.GetReviewsCountAsync(rentalLocationId);

        var response = new
        {
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
            Reviews = reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserId = r.UserId,
                UserName = r.User?.UserName ?? "Unknown"
            })
        };

        return Ok(response);
    }
    [HttpPut("{reviewId}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid reviewId, [FromBody] UpdateReviewDto dto)
    {
        var userId = User.Identity?.Name ?? throw new UnauthorizedAccessException();

        var updatedReview = await _reviewService.UpdateReviewAsync(reviewId, dto, userId);

        return Ok(updatedReview);
    }
}