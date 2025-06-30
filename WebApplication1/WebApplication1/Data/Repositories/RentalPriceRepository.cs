using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalPriceRepository : IRentalPriceRepository
{
    private readonly ApplicationDbContext _ctx;
    public RentalPriceRepository(ApplicationDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(RentalPrice price)
    {
        _ctx.RentalPrices.Add(price);
        await _ctx.SaveChangesAsync();
    }

    public async Task<RentalPrice?> GetByIdAsync(Guid id)
    {
        return await _ctx.RentalPrices
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task UpdateAsync(RentalPrice price)
    {
        _ctx.RentalPrices.Update(price);
        await _ctx.SaveChangesAsync();
    }

    public async Task DeleteAsync(RentalPrice price)
    {
        _ctx.RentalPrices.Remove(price);
        await _ctx.SaveChangesAsync();
    }
}