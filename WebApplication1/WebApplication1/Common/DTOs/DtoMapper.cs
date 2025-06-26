using WebApplication1.Data.Models;

namespace WebApplication1.Common.DTOs;

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
        Cars = model.Cars?.Where(c => !c.IsDeleted).Select(ToDto).ToList()
    };

    public static CarDto ToDto(Car car) => new CarDto
    {
        Id = car.Id,
        IsAvailable = car.IsAvailable,
        CarModelId = car.CarModelId,
        RentalPrices = car.RentalPrices?.Select(p => new RentalPriceDto
        {
            PriceType = p.PriceType,
            Price = p.Price
        }).ToList()
    };
}
