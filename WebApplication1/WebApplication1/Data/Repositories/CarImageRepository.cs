using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarImageRepository : ICarImageRepository
{
    private readonly ApplicationDbContext _ctx;

    public CarImageRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(CarImage image)
    {
        _ctx.CarImages.Add(image);
        await _ctx.SaveChangesAsync();
    }

    public async Task DeleteAsync(CarImage image)
    {
        _ctx.CarImages.Remove(image);
        await _ctx.SaveChangesAsync();
    }

    public async Task<CarImage?> GetByIdAsync(Guid id)
    {
        return await _ctx.CarImages.FindAsync(id);
    }

    public async Task<IEnumerable<CarImage>> GetByCarIdAsync(Guid carId)
    {
        return await _ctx.CarImages
            .Where(i => i.CarModelId == carId)
            .ToListAsync();
    }
}