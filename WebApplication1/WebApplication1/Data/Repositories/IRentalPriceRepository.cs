using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public interface IRentalPriceRepository
    {
        Task<RentalPrice> GetByIdAsync(Guid id);
        Task AddAsync(RentalPrice price);
        Task UpdateAsync(RentalPrice price);
        Task DeleteAsync(RentalPrice price);
    }
}