using Microsoft.EntityFrameworkCore;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Extensions;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalLocationRepository : IRentalLocationRepository
{
    private readonly ApplicationDbContext _context;

    public RentalLocationRepository(ApplicationDbContext ctx) => _context = ctx;

    public async Task AddAsync(RentalLocation loc)
    {
        _context.RentalLocations.Add(loc);
        await _context.SaveChangesAsync();
    }

    public async Task<RentalLocation?> GetByIdAsync(Guid id)
    {
        return await _context.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }
    


    public async Task<IEnumerable<RentalLocation>> ListAsync()
    {
        return await _context.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted))
            .ThenInclude(c => c.CarModel)
            .Where(r => !r.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(RentalLocation loc)
    {
        _context.RentalLocations.Update(loc);
        await _context.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(RentalLocation loc)
    {
        loc.IsDeleted = true;
        await UpdateAsync(loc);
    }

    public async Task<(IEnumerable<CarModelSummaryDto> Items, int TotalCount)> SearchCarModelsAsync(CarModelSearchParams searchParams)
    {
        var query = _context.Cars
            .Include(c => c.CarModel)
            .ThenInclude(cm => cm.RentalPrices)
            .Include(c => c.RentalLocation)
            .Include(c => c.Bookings)
            .Where(c => !c.IsDeleted && c.IsEnabled);

        query = query
            .WhereIfNotNullOrEmpty(searchParams.Country, c => c.RentalLocation != null && c.RentalLocation.Country == searchParams.Country)
            .WhereIfNotNullOrEmpty(searchParams.City, c => c.RentalLocation != null && c.RentalLocation.City == searchParams.City);

        if (searchParams.StartDate != null && searchParams.EndDate != null)
        {
            query = query.Where(c =>
                c.Bookings == null ||
                !c.Bookings.Any(b => !b.IsDeleted && searchParams.StartDate < b.EndDate && searchParams.EndDate > b.StartDate));
        }

        // Группируем в памяти
        var groupedInMemory = await query
            .AsNoTracking()
            .ToListAsync();

        var groupedModels = groupedInMemory
            .GroupBy(c => c.CarModel)
            .Select(g => new CarModelSummaryDto
            {
                CarModelId = g.Key!.Id,
                ModelName = g.Key.ModelName,
                Make = g.Key.Make,
                AvailableCarsCount = g.Count(),
                RentalPrices = g.Key.RentalPrices
                    .Select(rp => new RentalPriceDto
                    {
                        Id = rp.Id,
                        Price = rp.Price,
                        PriceType = rp.PriceType
                    }).ToList()
            })
            .OrderBy(cm => cm.ModelName)
            .ToList();

        var totalCount = groupedModels.Count;

        var items = groupedModels
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .ToList();

        return (items, totalCount);
    }
}
