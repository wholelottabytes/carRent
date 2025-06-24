using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public class Booking
    {
        public int Id { get; set; }

        // Booking period
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }

        // Foreign keys
        [Required]
        public string UserId { get; set; } = null!;
        public ApplicationUser? User { get; set; }

        [Required]
        public int CarId { get; set; }
        public Car? Car { get; set; }

        [Required]
        public int RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        // Key pickup times
        public DateTime? PickupTime { get; set; }
        public DateTime? ReturnTime { get; set; }

        // Calculated total price
        public decimal TotalPrice { get; set; }

        public ICollection<BookingAdditionalService>? BookingServices { get; set; }
    }
}