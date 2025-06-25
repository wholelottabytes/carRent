using System;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; } 

        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        [Required]
        public Guid RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        [Required]
        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }
    }
}