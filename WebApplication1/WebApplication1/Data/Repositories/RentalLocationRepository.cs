using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public class RentalLocationRepository : IRentalLocationRepository
{
    private readonly ApplicationDbContext _ctx;

    public RentalLocationRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(RentalLocation loc)
    {
        _ctx.RentalLocations.Add(loc);
        await _ctx.SaveChangesAsync();
    }

    public async Task<RentalLocation> GetByIdAsync(Guid id) =>
        await _ctx.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted)
        ?? throw new KeyNotFoundException();

    public async Task<IEnumerable<Car>> GetAvailableCarsAsync(Guid locationId)
    {
        var now = DateTime.UtcNow; 

        return await _ctx.Cars
            .Include(c => c.CarModel)
            .Include(c => c.RentalPrices)
            .Include(c => c.Bookings)
            .Where(c =>
                c.RentalLocationId == locationId &&
                !c.IsDeleted &&
                c.IsAvailable &&
                !c.Bookings.Any(b => 
                    !b.IsDeleted && 
                    b.StartDate <= now && 
                    b.EndDate >= now
                )
            )
            .ToListAsync();
    }
    

    public async Task<IEnumerable<RentalLocation>> ListAsync() =>
        await _ctx.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .Where(r => !r.IsDeleted)
            .ToListAsync();

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

    public async Task<IEnumerable<RentalLocation>> SearchAsync(string? country, string? city, DateTime? startDate, DateTime? endDate)
    {
        var query = _ctx.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted && c.IsAvailable))
            .ThenInclude(c => c.CarModel)
            .Where(r => !r.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(country))
            query = query.Where(r => r.Country == country);
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(r => r.City == city);

        if (startDate != null && endDate != null)
        {
            query = query.Where(r => r.Cars.Any(car =>
                car.IsAvailable && (
                    car.Bookings == null ||
                    !car.Bookings.Any(b => !b.IsDeleted && startDate < b.EndDate && endDate > b.StartDate)
                )
            ));
        }

        return await query.ToListAsync();
    }
}