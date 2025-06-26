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
            .Include(r=>r.Cars)
            .ThenInclude(c => c.CarModel)
            .FirstOrDefaultAsync(r=>r.Id==id && !r.IsDeleted)
        ?? throw new KeyNotFoundException();
    
    public async Task<IEnumerable<RentalLocation>> ListAsync() =>
        await _ctx.RentalLocations.Where(r=>!r.IsDeleted).ToListAsync();
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
}
