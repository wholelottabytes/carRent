using Microsoft.EntityFrameworkCore;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarModelRepository : ICarModelRepository
{
    private readonly ApplicationDbContext _context;

    public CarModelRepository(ApplicationDbContext ctx) => _context = ctx;

    public async Task AddAsync(CarModel m)
    {
        _context.CarModels.Add(m);
        await _context.SaveChangesAsync();
    }

    public async Task<CarModel?> GetByIdAsync(Guid id)
    {
        return await _context.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .Include(m => m.RentalPrices)  
            .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
    }

    public async Task<IEnumerable<CarModel>> ListAsync()
    {
        return await _context.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .Where(m => !m.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(CarModel m)
    {
        _context.CarModels.Update(m);
        await _context.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(CarModel m)
    {
        m.IsDeleted = true;
        await UpdateAsync(m);
    }
    public async Task<CarModel> AddFullModelAsync(
        CarModel model,
        List<RentalPrice> prices,
        List<IFormFile> images,
        IWebHostEnvironment env)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.CarModels.Add(model);
            await _context.SaveChangesAsync();

            foreach (var price in prices)
            {
                price.CarModelId = model.Id;
                _context.RentalPrices.Add(price);
            }

            if (!Directory.Exists(Path.Combine(env.WebRootPath, "uploads")))
                Directory.CreateDirectory(Path.Combine(env.WebRootPath, "uploads"));

            foreach (var file in images)
            {
                var ext = Path.GetExtension(file.FileName).ToLower();
                if (!new[] { ".jpg", ".jpeg", ".png" }.Contains(ext))
                    throw new Exception("Invalid image format");

                var filename = Guid.NewGuid() + ext;
                var fullPath = Path.Combine(env.WebRootPath, "uploads", filename);

                await using var stream = new FileStream(fullPath, FileMode.Create);
                await file.CopyToAsync(stream);

                _context.CarImages.Add(new CarImage
                {
                    CarModelId = model.Id,
                    Url = "/uploads/" + filename
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return model;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task<(IEnumerable<CarModelDto> Items, int TotalCount)> SearchAsync(CarModelSearchParamsModel searchParams)
    {
        var query = _context.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .Where(m => !m.IsDeleted);

        if (!string.IsNullOrWhiteSpace(searchParams.SearchQuery))
        {
            var search = searchParams.SearchQuery.Trim().ToLower();
            query = query.Where(m =>
                m.Make.ToLower().Contains(search) ||
                m.ModelName.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .AsNoTracking()
            .OrderBy(m => m.Make)
            .ThenBy(m => m.ModelName)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(m => new CarModelDto
            {
                Id = m.Id,
                Make = m.Make,
                ModelName = m.ModelName,
                Year = m.Year,
                Transmission = m.Transmission,
                SeatingCapacity = m.SeatingCapacity,
                FuelConsumptionPer100Km = m.FuelConsumptionPer100Km
            })
            .ToListAsync();

        return (items, totalCount);
    }
}