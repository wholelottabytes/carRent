using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarImageRepository : ICarImageRepository
{
    private readonly ApplicationDbContext _context;

    public CarImageRepository(ApplicationDbContext ctx) => _context = ctx;

    public async Task AddAsync(CarImage image)
    {
        _context.CarImages.Add(image);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(CarImage image)
    {
        _context.CarImages.Remove(image);
        await _context.SaveChangesAsync();
    }

    public async Task<CarImage?> GetByIdAsync(Guid id)
    {
        return await _context.CarImages.FindAsync(id);
    }

    public async Task<IEnumerable<CarImage>> GetByCarIdAsync(Guid carId)
    {
        return await _context.CarImages
            .Where(i => i.CarModelId == carId)
            .ToListAsync();
    }
}