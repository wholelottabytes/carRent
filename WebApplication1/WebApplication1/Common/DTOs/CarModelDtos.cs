using System.ComponentModel.DataAnnotations;
using WebApplication1.Data.Models;

namespace WebApplication1.Common.DTOs
{
    public class CarModelDto
    {
        public Guid Id { get; set; }
        public string Make { get; set; } = null!;
        public string ModelName { get; set; } = null!;
        public int Year { get; set; }
        public TransmissionType Transmission { get; set; }
        public int SeatingCapacity { get; set; }
        public double FuelConsumptionPer100Km { get; set; }
        public List<CarDto>? Cars { get; set; }
    }
    public class CreateCarModelDto
    {
        [Required] public string Make   { get; set; } = null!;
        [Required] public string ModelName  { get; set; } = null!; 
        [Required] public int    Year   { get; set; }
        [Required] public TransmissionType Transmission { get; set; }
        [Required] public int SeatingCapacity          { get; set; }
        [Required] public double FuelConsumptionPer100Km { get; set; }
    }
    public class UpdateCarModelDto : CreateCarModelDto { }
}