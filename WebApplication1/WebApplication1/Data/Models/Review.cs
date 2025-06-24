using System;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int Rating { get; set; } // 1 to 5

        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        [Required]
        public int RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        [Required]
        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }
    }
}