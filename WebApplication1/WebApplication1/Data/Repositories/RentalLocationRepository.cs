using Microsoft.EntityFrameworkCore;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalLocationRepository : IRentalLocationRepository
{
    private readonly ApplicationDbContext _ctx;

    public RentalLocationRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(RentalLocation loc)
    {
        _ctx.RentalLocations.Add(loc);
        await _ctx.SaveChangesAsync();
    }

    public async Task<RentalLocation?> GetByIdAsync(Guid id)
    {
        return await _ctx.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }
    


    public async Task<IEnumerable<RentalLocation>> ListAsync()
    {
        return await _ctx.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .Where(r => !r.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(RentalLocation loc)
    {
        _ctx.RentalLocations.Update(loc);
        await _ctx.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(RentalLocation loc)
    {
        loc.IsDeleted = true;
        await UpdateAsync(loc);
    }

    public async Task<(IEnumerable<CarModelSummaryDto> Items, int TotalCount)> SearchCarModelsAsync(
        string? country, string? city, DateTime? startDate, DateTime? endDate, int page, int pageSize)
    {
        var query = _ctx.Cars
            .Include(c => c.CarModel)
            .ThenInclude(cm => cm.RentalPrices)
            .Include(c => c.RentalLocation)
            .Include(c => c.Bookings)
            .Where(c => !c.IsDeleted && c.IsEnabled);

        if (!string.IsNullOrEmpty(country))
            query = query.Where(c => c.RentalLocation != null && c.RentalLocation.Country == country);

        if (!string.IsNullOrEmpty(city))
            query = query.Where(c => c.RentalLocation != null && c.RentalLocation.City == city);

        if (startDate != null && endDate != null)
        {
            query = query.Where(c =>
                c.Bookings == null ||
                !c.Bookings.Any(b => !b.IsDeleted && startDate < b.EndDate && endDate > b.StartDate)
            );
        }

        var grouped = query
            .GroupBy(c => c.CarModel!)
            .Select(g => new CarModelSummaryDto
            {
                CarModelId = g.Key.Id,
                ModelName = g.Key.ModelName,
                Make = g.Key.Make,
                AvailableCarsCount = g.Count(),
                RentalPrices = g.Key.RentalPrices.Select(rp => new RentalPriceDto
                {
                    Id = rp.Id,
                    Price = rp.Price,
                    PriceType = rp.PriceType
                }).ToList()
            })
            .OrderBy(cm => cm.ModelName);

        var totalCount = await grouped.CountAsync();

        var items = await grouped
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
