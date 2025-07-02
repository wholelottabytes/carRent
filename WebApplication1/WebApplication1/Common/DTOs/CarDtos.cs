using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Common.DTOs
{
    public class CarDtoLocation
    {
        public Guid Id { get; set; }
        public string ModelName { get; set; } = null!;
        public string Make { get; set; } = null!;
        public bool IsEnabled { get; set; }
    }

    public class CarDto
    {
        public Guid Id { get; set; }
        public bool IsEnabled { get; set; }
        public Guid CarModelId { get; set; }
        public Guid RentalLocationId { get; set; }
        public List<RentalPriceDto>? RentalPrices { get; set; }
    }

    public class CarWithCarModelDto
    {
        public Guid Id { get; set; }
        public bool IsEnabled { get; set; }
        public Guid CarModelId { get; set; }
        public Guid RentalLocationId { get; set; }
        public CarModelWithoutCarsDto? CarModel { get; set; }
        public List<RentalPriceDto>? RentalPrices { get; set; }
    }

    public class CreateCarDto
    {
        [Required] public Guid CarModelId { get; set; }
        [Required] public Guid RentalLocationId { get; set; }
    }

    public class UpdateCarDto : CreateCarDto
    {
        public bool? IsEnabled { get; set; }
    }
}