using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Common.DTOs;

public class CreateReviewDto
{
    [Required]
    public Guid RentalLocationId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comment { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
}
