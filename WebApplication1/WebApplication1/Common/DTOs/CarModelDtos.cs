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
        public List<CarModelImageDto>? Images { get; set; }
        public List<RentalPriceDto>? RentalPrices { get; set; }
    }

    public class CarModelWithoutCarsDto
    {
        public Guid Id { get; set; }
        public string Make { get; set; } = null!;
        public string ModelName { get; set; } = null!;
        public int Year { get; set; }
        public TransmissionType Transmission { get; set; }
        public int SeatingCapacity { get; set; }
        public double FuelConsumptionPer100Km { get; set; }
        public List<CarModelImageDto>? Images { get; set; }
        public List<RentalPriceDto>? RentalPrices { get; set; }
    }

    public class CreateCarModelDto
    {
        [Required] public string Make { get; set; } = null!;
        [Required] public string ModelName { get; set; } = null!;
        [Required] public int Year { get; set; }
        [Required] public TransmissionType Transmission { get; set; }
        [Required] public int SeatingCapacity { get; set; }
        [Required] public double FuelConsumptionPer100Km { get; set; }
    }
    public class UpdateCarModelDto : CreateCarModelDto { }
    
    public class CarModelSummaryDto
    {
        public Guid CarModelId { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public double FuelConsumptionPer100Km { get; set; }
        public int AvailableCarsCount { get; set; }
        public List<RentalPriceDto>? RentalPrices { get; set; }
        public List<RentalLocationWithServicesDto>? AvailableAtLocations { get; set; } 
    }

    public class RentalLocationShortDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public string Address { get; set; } = "";
    }
    public class CarModelSearchParams : PaginationParams
    {
        public string? Country { get; set; }
        public string? City { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class CreateFullCarModelDto
    {
        [Required]
        public string Make { get; set; }

        [Required]
        public string ModelName { get; set; }

        [Range(1900, 2100)]
        public int Year { get; set; }

        [Required]
        public TransmissionType Transmission { get; set; }

        [Range(1, 20)]
        public int SeatingCapacity { get; set; }

        [Range(0, double.MaxValue)]
        public double FuelConsumptionPer100Km { get; set; }

        [Required]
        public List<RentalPriceDto> RentalPrices { get; set; }
    }

    
}