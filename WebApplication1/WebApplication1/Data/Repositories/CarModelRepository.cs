using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarModelRepository : ICarModelRepository
{
    private readonly ApplicationDbContext _ctx;

    public CarModelRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(CarModel m)
    {
        _ctx.CarModels.Add(m);
        await _ctx.SaveChangesAsync();
    }

    public async Task<CarModel?> GetByIdAsync(Guid id)
    {
        return await _ctx.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted);
    }

    public async Task<IEnumerable<CarModel>> ListAsync()
    {
        return await _ctx.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .Where(m => !m.IsDeleted)
            .ToListAsync();
    }

    public async Task UpdateAsync(CarModel m)
    {
        _ctx.CarModels.Update(m);
        await _ctx.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(CarModel m)
    {
        m.IsDeleted = true;
        await UpdateAsync(m);
    }
}