using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Data.Models
{
    public enum TransmissionType
    {
        Manual,
        Automatic,
        SemiAutomatic
    }

    public class Car
    {
        public int Id { get; set; }

        [Required]
        public string Make { get; set; } = null!;

        [Required]
        public string Model { get; set; } = null!;

        [Required]
        public int SeatingCapacity { get; set; }

        [Required]
        public double FuelConsumptionPer100Km { get; set; }

        [Required]
        public TransmissionType Transmission { get; set; }

        [Required]
        public decimal HourRate { get; set; }

        public bool IsAvailable { get; set; } = true;

        // Foreign key
        public int RentalLocationId { get; set; }
        public RentalLocation? RentalLocation { get; set; }

        public ICollection<CarImage>? Images { get; set; }
        public ICollection<Booking>? Bookings { get; set; }
    }
}