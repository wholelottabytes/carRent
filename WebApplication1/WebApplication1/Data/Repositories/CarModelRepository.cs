using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public class CarModelRepository : ICarModelRepository
{
    private readonly ApplicationDbContext _ctx;
    public CarModelRepository(ApplicationDbContext ctx) => _ctx = ctx;
    public async Task AddAsync(CarModel m)
    {
        _ctx.CarModels.Add(m);
        await _ctx.SaveChangesAsync();
    }
    public async Task<CarModel> GetByIdAsync(Guid id) =>
        await _ctx.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted)) 
            .FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted)
        ?? throw new KeyNotFoundException();

    public async Task<IEnumerable<CarModel>> ListAsync() =>
        await _ctx.CarModels
            .Include(m => m.Cars.Where(c => !c.IsDeleted))
            .Where(m => !m.IsDeleted)
            .ToListAsync();
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