using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Data.Models
{
    public enum TransmissionType
    {
        Manual,
        Automatic,
        SemiAutomatic
    }
    public class CarModel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public bool IsDeleted { get; set; } = false;
        [Required]
        public string Make { get; set; } = null!; 

        [Required]
        public string ModelName { get; set; } = null!; 

        [Required]
        public int Year { get; set; }

        [Required]
        public TransmissionType Transmission { get; set; }

        [Required]
        public int SeatingCapacity { get; set; }

        [Required]
        public double FuelConsumptionPer100Km { get; set; }

        public ICollection<Car>? Cars { get; set; }
    }
}