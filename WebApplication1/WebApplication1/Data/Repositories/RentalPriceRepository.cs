using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalPriceRepository : IRentalPriceRepository
{
    private readonly ApplicationDbContext _context;
    public RentalPriceRepository(ApplicationDbContext ctx) => _context = ctx;

    public async Task AddAsync(RentalPrice price)
    {
        _context.RentalPrices.Add(price);
        await _context.SaveChangesAsync();
    }

    public async Task<RentalPrice?> GetByIdAsync(Guid id)
    {
        return await _context.RentalPrices
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task UpdateAsync(RentalPrice price)
    {
        _context.RentalPrices.Update(price);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(RentalPrice price)
    {
        _context.RentalPrices.Remove(price);
        await _context.SaveChangesAsync();
    }
}