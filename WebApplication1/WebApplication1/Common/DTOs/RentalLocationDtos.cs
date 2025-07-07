using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Common.DTOs
{
    public class RentalLocationDto
    {
        public Guid Id { get; set; }
        public string Country { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Address { get; set; } = null!;
        public List<CarDtoLocation> Cars { get; set; } = new();
    }
    public class CreateRentalLocationDto
    {
        [Required] public string Country { get; set; } = null!;
        [Required] public string City    { get; set; } = null!;
        [Required] public string Name    { get; set; } = null!;
        [Required] public string Address { get; set; } = null!;
    }
    public class UpdateRentalLocationDto : CreateRentalLocationDto { }
    public class RentalLocationWithServicesDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public List<AdditionalServiceDto> AdditionalServices { get; set; } = new List<AdditionalServiceDto>();
    }
}
