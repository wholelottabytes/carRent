using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public class CarRepository : ICarRepository
    {
        private readonly ApplicationDbContext _context;
        public CarRepository(ApplicationDbContext ctx) => _context = ctx;

        public async Task AddAsync(Car car)
        {
            _context.Cars.Add(car);
            await _context.SaveChangesAsync();
        }

        public async Task<Car> GetByIdAsync(Guid id) =>
            await _context.Cars
                .Include(c=>c.CarModel)
                .ThenInclude(c => c.Images)
                .Include(c=>c.CarModel)
                .ThenInclude(c => c.RentalPrices)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted)
            ?? throw new KeyNotFoundException();

        public async Task<IEnumerable<Car>> ListAsync() =>
            await _context.Cars.Where(c => !c.IsDeleted).ToListAsync();

        public async Task UpdateAsync(Car car)
        {
            _context.Cars.Update(car);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(Car car)
        {
            car.IsDeleted = true;
            await UpdateAsync(car);
        }
        
        public async Task<List<Car>> GetCarsByModelAndLocationAsync(Guid modelId, Guid locationId)
        {
            return await _context.Cars
                .Where(c =>
                    c.CarModelId == modelId &&
                    c.RentalLocationId == locationId &&
                    !c.IsDeleted &&
                    c.IsEnabled)
                .Include(c => c.Bookings.Where(b => !b.IsDeleted))
                .ToListAsync();
        }
        
     public async Task<Car?> GetSingleAvailableCarAsync(
    Guid carModelId,
    Guid rentalLocationId,
    DateTimeOffset startDate,
    DateTimeOffset endDate)
{
    
    startDate = startDate.ToUniversalTime();
    endDate   = endDate.ToUniversalTime();

    var baseQuery = _context.Cars
        .AsSplitQuery() 
        .Include(c => c.CarModel).ThenInclude(m => m!.RentalPrices)
        .Include(c => c.RentalLocation).ThenInclude(l => l!.AdditionalServices.Where(s => !s.IsDeleted))
        .Include(c => c.Bookings) 
        .Where(c =>
            !c.IsDeleted &&
            c.IsEnabled &&
            c.CarModelId == carModelId &&
            c.RentalLocationId == rentalLocationId &&
            
            !c.Bookings.Any(b =>
                !b.IsDeleted && 
                startDate < b.EndDate &&
                endDate > b.StartDate
            )
        );

   
    var carsListForDebug = await baseQuery.ToListAsync();
    return carsListForDebug.FirstOrDefault();
}
     
     
      public async Task<(IEnumerable<RentalLocation> Items, int TotalCount)> SearchAsync(CarSearchParams searchParams)
    {
        var query = _context.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .Where(r => !r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(searchParams.SearchQuery))
        {
            var search = searchParams.SearchQuery.Trim().ToLower();
            query = query.Where(r =>
                r.Cars.Any(c =>
                    c.CarModel.Make.ToLower().Contains(search) ||
                    c.CarModel.ModelName.ToLower().Contains(search)) ||
                r.City.ToLower().Contains(search) ||
                r.Name.ToLower().Contains(search) ||
                r.Address.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .AsNoTracking()
            .OrderBy(r => r.City)
            .ThenBy(r => r.Name)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(r => new RentalLocation
            {
                Id = r.Id,
                Country = r.Country,
                City = r.City,
                Name = r.Name,
                Address = r.Address,
                Cars = r.Cars.Select(c => new Car
                {
                    Id = c.Id,
                    CarModelId = c.CarModelId,
                    RentalLocationId = c.RentalLocationId,
                    IsEnabled = c.IsEnabled,
                    CarModel = new CarModel
                    {
                        Id = c.CarModel.Id,
                        Make = c.CarModel.Make,
                        ModelName = c.CarModel.ModelName,
                        Year = c.CarModel.Year,
                        Transmission = c.CarModel.Transmission,
                        SeatingCapacity = c.CarModel.SeatingCapacity,
                        FuelConsumptionPer100Km = c.CarModel.FuelConsumptionPer100Km
                    }
                }).ToList()
            })
            .ToListAsync();

        return (items, totalCount);
    }
    }
    
}