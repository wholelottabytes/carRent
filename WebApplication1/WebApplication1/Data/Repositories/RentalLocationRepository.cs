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
    public async Task<RentalLocation?> GetByIdPagedAsync(Guid id, int page, int pageSize)
    {
        return await _context.RentalLocations
            .Include(r => r.Cars.Where(c => !c.IsDeleted)
                .Skip((page - 1) * pageSize)
                .Take(pageSize))
            .ThenInclude(c => c.CarModel)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }
    
    public async Task<(IEnumerable<RentalLocationSimpleDto> Items, int TotalCount)> SearchDeletedAsync(LocationSearchParams searchParams)
    {
        var query = _context.RentalLocations.AsQueryable()
            .Where(r => r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(searchParams.SearchQuery))
        {
            var search = searchParams.SearchQuery.ToLower();
            query = query.Where(r =>
                r.Country.ToLower().Contains(search) ||
                r.City.ToLower().Contains(search) ||
                r.Name.ToLower().Contains(search) ||
                r.Address.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(r => r.City)
            .ThenBy(r => r.Name)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(r => new RentalLocationSimpleDto
            {
                Id = r.Id,
                Country = r.Country,
                City = r.City,
                Name = r.Name,
                Address = r.Address
            })
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task RestoreAsync(Guid id)
    {
        var location = await _context.RentalLocations.FindAsync(id);
        if (location is not null)
        {
            location.IsDeleted = false;
            _context.RentalLocations.Update(location);
            await _context.SaveChangesAsync();

        }
    }
    public async Task<bool> HasCarsAsync(Guid locationId)
    {
        return await _context.Cars.AnyAsync(c => c.RentalLocationId == locationId && c.IsEnabled);
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

    public async Task SoftDeleteAsync(RentalLocation location)
    {
        var hasCars = await HasCarsAsync(location.Id);
        if (hasCars)
        {
            location.IsDeleted = true;
            _context.RentalLocations.Update(location);
            await _context.SaveChangesAsync(); 
        }
        else
        {
            _context.RentalLocations.Remove(location);
            await _context.SaveChangesAsync();
        }
    }

   public async Task<(IEnumerable<CarModelSummaryDto> Items, int TotalCount)> SearchCarModelsAsync(CarModelSearchParams searchParams)
    {
        Console.WriteLine($"[DBG] searchParams.StartDate = {searchParams.StartDate}, Kind={searchParams.StartDate?.Kind}");

        var query = _context.Cars
            .Include(c => c.CarModel)
                .ThenInclude(cm => cm.RentalPrices)
            .Include(c => c.RentalLocation)
                .ThenInclude(rl => rl!.AdditionalServices.Where(s => !s.IsDeleted))
            .Include(c => c.Bookings)
            .Where(c => !c.IsDeleted && c.IsEnabled && !c.CarModel.IsDeleted);

        query = query
            .WhereIfNotNullOrEmpty(searchParams.Country, c => c.RentalLocation != null && c.RentalLocation.Country == searchParams.Country)
            .WhereIfNotNullOrEmpty(searchParams.City, c => c.RentalLocation != null && c.RentalLocation.City == searchParams.City);

        if (searchParams.StartDate != null && searchParams.EndDate != null)
        {
            query = query.Where(c =>
                c.Bookings == null ||
                !c.Bookings.Any(b => !b.IsDeleted && searchParams.StartDate < b.EndDate && searchParams.EndDate > b.StartDate));
        }

        var groupedInMemory = await query
            .AsNoTracking()
            .ToListAsync();

        var groupedModels = groupedInMemory
            .GroupBy(c => c.CarModel!.Id)
            .Select(g =>
            {
                var model = g.First().CarModel!;
                var locations = g
                    .Where(c => c.RentalLocation != null)
                    .Select(c => c.RentalLocation!)
                    .DistinctBy(loc => loc.Id)
                    .Select(loc => new RentalLocationWithServicesDto
                    {
                        Id = loc.Id,
                        Name = loc.Name,
                        City = loc.City,
                        Address = loc.Address,
                        AdditionalServices = loc.AdditionalServices
                            .Select(s => new AdditionalServiceDto
                            {
                                Id = s.Id,
                                Name = s.Name,
                                Price = s.Price,
                                RentalLocationId = s.RentalLocationId
                            })
                            .ToList()
                    })
                    .ToList();

                return new CarModelSummaryDto
                {
                    CarModelId = model.Id,
                    ModelName = model.ModelName,
                    Make = model.Make,
                    Year = model.Year,
                    Transmission = model.Transmission.ToString(),
                    SeatingCapacity = model.SeatingCapacity,
                    FuelConsumptionPer100Km = model.FuelConsumptionPer100Km,
                    AvailableCarsCount = g.Count(),
                    RentalPrices = model.RentalPrices
                        .Select(rp => new RentalPriceDto
                        {
                            Id = rp.Id,
                            Price = rp.Price,
                            PriceType = rp.PriceType
                        }).ToList(),
                    AvailableAtLocations = locations
                };
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
    public async Task<(IEnumerable<RentalLocationSimpleDto> Items, int TotalCount)> SearchAsync(LocationSearchParams searchParams)
    {
        var query = _context.RentalLocations
            .Where(r => !r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(searchParams.SearchQuery))
        {
            var search = searchParams.SearchQuery.Trim().ToLower();
            query = query.Where(r =>
                r.Country.ToLower().Contains(search) ||
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
            .Select(r => new RentalLocationSimpleDto
            {
                Id = r.Id,
                Country = r.Country,
                City = r.City,
                Name = r.Name,
                Address = r.Address
            })
            .ToListAsync();

        return (items, totalCount);
    }
}
