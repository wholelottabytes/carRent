using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class Booking
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool IsDeleted { get; set; } = false;

        // Booking period
        [Required]
        public DateTimeOffset StartDate { get; set; }
        [Required]
        public DateTimeOffset EndDate { get; set; }

        // Foreign keys
        [Required]
        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }

        [Required]
        public Guid CarId { get; set; }
        public Car? Car { get; set; }

        [Required]
        public Guid RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        // Key pickup times
        public DateTimeOffset? PickupTime { get; set; }
        public DateTimeOffset? ReturnTime { get; set; }
        
        
        // Calculated total price
        public decimal TotalPrice { get; set; }

        public ICollection<BookingAdditionalService>? BookingServices { get; set; }
    }
}