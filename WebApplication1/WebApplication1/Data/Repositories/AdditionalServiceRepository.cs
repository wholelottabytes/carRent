using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Context;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public class AdditionalServiceRepository : IAdditionalServiceRepository
    {
        private readonly ApplicationDbContext _context;
        public AdditionalServiceRepository(ApplicationDbContext ctx) => _context = ctx;

        public async Task AddAsync(AdditionalService service)
        {
            _context.AdditionalServices.Add(service);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AdditionalService>> GetByLocationIdAsync(Guid locationId)
        {
            return await _context.AdditionalServices
                .Where(s => s.RentalLocationId == locationId && !s.IsDeleted)
                .ToListAsync();
        }

        public async Task<AdditionalService?> GetByIdAsync(Guid id)
        {
            return await _context.AdditionalServices
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);
        }

        public async Task UpdateAsync(AdditionalService service)
        {
            _context.AdditionalServices.Update(service);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(AdditionalService service)
        {
            service.IsDeleted = true;
            await UpdateAsync(service);
        }
    }
}