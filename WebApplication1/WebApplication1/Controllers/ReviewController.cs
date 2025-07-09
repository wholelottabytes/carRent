using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Business.Services;
using WebApplication1.Data.Models;

namespace WebApplication1.API.Controllers;

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
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();
        var review = new Review
        {
            RentalLocationId = dto.RentalLocationId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        var createdReview = await _reviewService.CreateReviewAsync(review);
        return CreatedAtAction(nameof(GetByRentalLocation), new { rentalLocationId = createdReview.RentalLocationId }, createdReview);
    }

    [HttpGet("{rentalLocationId}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<IActionResult> GetByRentalLocation(Guid rentalLocationId, [FromQuery] PaginationParams pagination)
    {
        var reviewsDto = await _reviewService.GetReviewsAsync(rentalLocationId, pagination);
        var totalCount = await _reviewService.GetReviewsCountAsync(rentalLocationId);

        return Ok(new
        {
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
            Reviews = reviewsDto
        });
    }
    
    [HttpPut("{reviewId}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<IActionResult> Update(Guid reviewId, [FromBody] UpdateReviewDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var updatedReviewDto = await _reviewService.UpdateReviewAsync(reviewId, dto, userId);
        return Ok(updatedReviewDto);
    }

}
