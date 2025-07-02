using WebApplication1.Data.Models;
using WebApplication1.Common.DTOs;

namespace WebApplication1.Common.DTOs
{
    public static class DtoMapper
    {
        public static CarModelDto ToDto(CarModel model) => new CarModelDto
        {
            Id = model.Id,
            Make = model.Make,
            ModelName = model.ModelName,
            Year = model.Year,
            Transmission = model.Transmission,
            SeatingCapacity = model.SeatingCapacity,
            FuelConsumptionPer100Km = model.FuelConsumptionPer100Km,
            RentalPrices = model.RentalPrices?.Select(p => new RentalPriceDto
            {
                Id = p.Id,
                Price = p.Price,
                PriceType = p.PriceType,
                CarModelId = p.CarModelId
            }).ToList(),
            Images = model.Images?.Select(img => new CarModelImageDto
            {
                Id = img.Id,
                Url = img.Url,
                CarModelId = img.CarModelId
            }).ToList(),
            Cars = model.Cars?.Select(ToDto).ToList()
        };

        public static CarDto ToDto(Car car) => new CarDto
        {
            Id = car.Id,
            IsEnabled = car.IsEnabled,
            CarModelId = car.CarModelId,
            RentalLocationId = car.RentalLocationId
        };

        public static CarWithCarModelDto ToDtoWithCar(Car car) => new CarWithCarModelDto
        {
            Id = car.Id,
            IsEnabled = car.IsEnabled,
            CarModelId = car.CarModelId,
            RentalLocationId = car.RentalLocationId,
            CarModel = car.CarModel == null ? null : ToDtoWithoutCars(car.CarModel)
        };

        public static CarModelWithoutCarsDto ToDtoWithoutCars(CarModel model) => new CarModelWithoutCarsDto
        {
            Id = model.Id,
            Make = model.Make,
            ModelName = model.ModelName,
            Year = model.Year,
            Transmission = model.Transmission,
            SeatingCapacity = model.SeatingCapacity,
            FuelConsumptionPer100Km = model.FuelConsumptionPer100Km,
            RentalPrices = model.RentalPrices?.Select(p => new RentalPriceDto
            {
                Id = p.Id,
                Price = p.Price,
                PriceType = p.PriceType,
                CarModelId = p.CarModelId
            }).ToList(),
            Images = model.Images?.Select(img => new CarModelImageDto
            {
                Id = img.Id,
                Url = img.Url,
                CarModelId = img.CarModelId
            }).ToList()
        };
    }
}
